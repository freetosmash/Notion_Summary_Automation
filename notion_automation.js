require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const { Client } = require('@notionhq/client');

const app = express();

// 从.env文件中读取环境变量
const notionApiKey = process.env.NOTION_API_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;
const summarizationApi = process.env.SUMMARIZATION_API;
const databaseIds = process.env.DATABASE_IDS.split(',');
const port = process.env.PORT || 3000;
const intervalMinutes = process.env.INTERVAL_MINUTES || 30;

// 这是你需要添加的函数，用于获取所有块的内容
async function getAllBlocks(blockId, notion) {
    let blocks = [];
    let hasMore = true;
    let startCursor = undefined;

    while (hasMore) {
        const response = await notion.blocks.children.list({
            block_id: blockId,
            start_cursor: startCursor,
            page_size: 100,
        });

        // 打印 Notion API 返回的数据
        console.log('Notion API response:', JSON.stringify(response, null, 2));

        blocks = blocks.concat(response.results);
        console.log(blocks);
        hasMore = response.has_more;
        startCursor = response.next_cursor;
    }

    let textContent = blocks.map(getTextFromBlock).join(' ');
    return textContent;
}


function getTextFromBlock(block) {
    console.log('Block type:', block.type);
    console.log('Block content:', block);
    let textContent = '';
    if (block.type === 'paragraph' && block.paragraph.rich_text) {
        for (let textElement of block.paragraph.rich_text) {
            textContent += textElement.plain_text;
        }
    } else if (block.type === 'bulleted_list_item' && block.bulleted_list_item.text) {
        for (let textElement of block.bulleted_list_item.text) {
            textContent += textElement.plain_text;
        }
    } else if (block.type === 'heading_1' && block.heading_1.text) {
        for (let textElement of block.heading_1.text) {
            textContent += textElement.plain_text;
        }
    } else if (block.type === 'heading_2' && block.heading_2.text) {
        for (let textElement of block.heading_2.text) {
            textContent += textElement.plain_text;
        }
    } else if (block.type === 'heading_3' && block.heading_3.text) {
        for (let textElement of block.heading_3.text) {
            textContent += textElement.plain_text;
        }
    } else if (block.type === 'to_do' && block.to_do.text) {
        for (let textElement of block.to_do.text) {
            textContent += textElement.plain_text;
        }
    } else if (block.type === 'toggle' && block.toggle.text) {
        for (let textElement of block.toggle.text) {
            textContent += textElement.plain_text;
        }
    } else if (block.type === 'child_page') {
        textContent += block.child_page.title;
    } else if (block.type === 'image' && block.image.caption) {
        for (let textElement of block.image.caption) {
            textContent += textElement.plain_text;
        }
    } else if (block.type === 'quote' && block.quote.text) {  // 这是我提供的代码片段
        for (let textElement of block.quote.text) {
            textContent += textElement.plain_text;
        }
    }
    console.log('Extracted text:', textContent);
    return textContent;
}

async function handleRequest() {
    const notion = new Client({ auth: notionApiKey });

    for (const databaseId of databaseIds) {
        // Fetch the list of pages in the Notion database
        const notionResponse = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${notionApiKey}`,
                'Notion-Version': '2022-06-28',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        });

        const notionData = await notionResponse.json();
        // Iterate over each page in the database
        for (const page of notionData.results) {
        const pageId = page.id;
        const summary = page.properties.Summary.rich_text[0]?.text.content;

        // If the Summary cell already has content, skip this page
        if (summary) {
            console.log(`Skipping page ${pageId} because it already has a summary`);
            continue;
        }
        // Fetch the content of the linked page
        let content = await getAllBlocks(pageId, notion);

        // Split the content into chunks of 4000 characters
        let chunks = [];
        for (let i = 0; i < content.length; i += 4000) {
            chunks.push(content.slice(i, i + 4000));
        }

if (summarizationApi === 'openai') {
    // 使用OpenAI API生成摘要
    for (let chunk of chunks) {
        try {
            const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${openaiApiKey}`,  
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [{
                        role: 'system',
                        content: `You are an experienced writer, skilled at summarizing textual content. Now, you need help summarizing the content of each Notion page accurately, and providing a summary of 100-120 Chinese characters, which should be outputted to the Summary column.`
                    }, {
                        role: 'user',
                        content: `Summarize the following text: ${chunk}`
                    }]
                })
            });

            if (!openaiResponse.ok) {
                throw new Error(`OpenAI API responded with status code ${openaiResponse.status}`);
            }

            const openaiData = await openaiResponse.json();
            const summaryGenerated = openaiData.choices[0].message.content;

            summaries.push(summaryGenerated);
        } catch (error) {
            console.error('Error occurred while generating summary:', error);
        }
    }
} else if (summarizationApi === 'azure') {
    // 使用Azure API生成摘要
    const azureApiBase = process.env.AZURE_API_BASE;
    const azureApiVersion = process.env.AZURE_API_VERSION;

    for (let chunk of chunks) {
        try {
            const azureResponse = await fetch(`${azureApiBase}/v1/chat/completions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${openaiApiKey}`,  
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    deployment_id: 'gpt-3.5-turbo',
                    messages: [{
                        role: 'system',
                        content: `You are an experienced writer, skilled at summarizing textual content. Now, you need help summarizing the content of each Notion page accurately, and providing a summary of 100-120 Chinese characters, which should be outputted to the Summary column.`
                    }, {
                        role: 'user',
                        content: `Summarize the following text: ${chunk}`
                    }]
                })
            });

            if (!azureResponse.ok) {
                throw new Error(`Azure API responded with status code ${azureResponse.status}`);
            }

            const azureData = await azureResponse.json();
            const summaryGenerated = azureData.choices[0].message.content;

            summaries.push(summaryGenerated);
        } catch (error) {
            console.error('Error occurred while generating summary:', error);
        }
    }
} else {
    console.error(`Invalid summarization API: ${summarizationApi}`);
}

        // Combine all summaries into one
        let finalSummary = summaries.join(' ');

        try {
            // Update the Notion page with the final summary
            const updateResponse = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${notionApiKey}`,
                    'Notion-Version': '2022-06-28',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    properties: {
                        'Summary': {
                            'rich_text': [
                                {
                                    'text': {
                                        'content': finalSummary
                                    }
                                }
                            ]
                        }
                    }
                })
            });

            if (!updateResponse.ok) {
                console.error(`Notion API responded with status code ${updateResponse.status} when updating page ${pageId}`);
            }
        } catch (error) {
            console.error('Error occurred while generating summary or updating page:', error);
        }
    }

    return 'Notion pages updated with summaries';
}
    app.get('/', async (req, res) => {
        const result = await handleRequest();
        res.send(result);
    });

     app.listen(port, () => {
          console.log(`App listening at http://localhost:${port}`);
     });

