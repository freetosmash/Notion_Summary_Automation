require('dotenv').config({ path: '/root/Notion_Summary_Automation/.env' });
const express = require('express');
const fetch = require('node-fetch');
const { Client } = require('@notionhq/client');
const { OpenAIClient, AzureKeyCredential } = require("@azure/openai");  // 引入 Azure OpenAI 客户端库

const app = express();

// 从.env文件中读取环境变量
const notionApiKey = process.env.NOTION_API_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;
const summarizationApi = process.env.SUMMARIZATION_API;
const databaseIds = process.env.DATABASE_IDS.split(',');
const port = process.env.PORT || 3000;
const intervalMinutes = process.env.INTERVAL_MINUTES || 30;
const azureApiBase = process.env.AZURE_API_BASE;
const azureApiVersion = process.env.AZURE_API_VERSION;
const deploymentName = process.env.AZURE_DEPLOYMENT_NAME;  // 新增的环境变量

// 创建 Azure OpenAI 客户端
const azureClient = new OpenAIClient(azureApiBase, new AzureKeyCredential(openaiApiKey));

// 这是你需要添加的函数，用于获取所有块的内容
async function getAllBlocks(blockId, notion) {
    let blocks = [];
    let hasMore = true;
    let startCursor = undefined;
    let textContent = '';  // 将 textContent 定义在这里
    
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

    for (const block of blocks) {
        console.log('Processing block:', block);  // 打印正在处理的块
        try {
            textContent += getTextFromBlock(block);  // 将提取的文本添加到 textContent 的末尾
        } catch (error) {
            console.error('Error occurred while processing block:', error);  // 打印出错误信息
        }
    }
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
    } else if (block.type === 'callout' && block.callout.rich_text) {
        for (let textElement of block.callout.rich_text) {
            textContent += textElement.plain_text;
        }
    }
    
    console.log('Extracted text:', textContent);
    return textContent;
}

async function handleRequest() {
    const notion = new Client({ auth: notionApiKey });
    let pagesUpdated = 0;  // 记录更新的页面数
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
        console.log(notionData);  // 打印 notionData
        // Iterate over each page in the database
        for (const page of notionData.results) {
            let summaries = [];  // Clear the summaries array here
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
                        content: `You are an experienced writer, skilled at summarizing textual content. Now, you need help summarizing the content of each Notion page accurately, and providing a summary of less than 100 Chinese characters, which should be outputted to the Summary column. `
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
}

    else if (summarizationApi === 'azure') {
        // 使用Azure API生成摘要
        for (let chunk of chunks) {
            try {
                console.log(`Summarize the following text: ${chunk}`);  // 添加这一行
                const azureData = await azureClient.getChatCompletions(deploymentName, [
                    {
                        role: 'system',
                        content: `You are an experienced writer, skilled at summarizing textual content. Now, you need help summarizing the content of each Notion page accurately, and providing a summary of less than 100 Chinese characters, which should be outputted to the Summary column. `
                    },
                    {
                        role: 'user',
                        content: `Summarize the following text: ${chunk}`
                    }
                ]);
                console.log(azureData);  // 打印 azureData 对象
                const summaryGenerated = azureData.choices[0].message.content;
                console.log(`Generated summary: ${summaryGenerated}`);  // 添加这一行
                summaries.push(summaryGenerated);
            } catch (error) {
                console.error('Error occurred while generating summary:', error);
            }
        }
    }else {
    console.error(`Invalid summarization API: ${summarizationApi}`);
}

        // Combine all summaries into one
        let finalSummary = summaries.join(' ');

            if (summarizationApi === 'openai') {
                // Send finalSummary to OpenAI for another summarization
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
                content: `You are an experienced writer, skilled at summarizing textual content. Now, you need help summarizing the content of each Notion page accurately, and providing a summary of less than 100 Chinese characters, which should be outputted to the Summary column. `
            }, {
                role: 'user',
                content: `Summarize the following text: ${finalSummary}`
            }]
        })
    });

    if (!openaiResponse.ok) {
        throw new Error(`OpenAI API responded with status code ${openaiResponse.status}`);
    }

    const openaiData = await openaiResponse.json();
    finalSummary = openaiData.choices[0].message.content;
            } else if (summarizationApi === 'azure') {
                // Send finalSummary to Azure for another summarization
                const azureData = await azureClient.getChatCompletions(deploymentName, [
                    {
                        role: 'system',
                        content: `You are an experienced writer, skilled at summarizing textual content. Now, you need help summarizing the content of each Notion page accurately, and providing a summary of less than 100 Chinese characters, which should be outputted to the Summary column. `
                    },
                    {
                        role: 'user',
                        content: `Summarize the following text: ${finalSummary}`
                    }
                ]);

                finalSummary = azureData.choices[0].message.content;
            } else {
                console.error(`Invalid summarization API: ${summarizationApi}`);
            }
            // Update the page with the final summary
            try {
                await notion.pages.update({
                    page_id: pageId,
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
                });
                console.log(`Updated page ${pageId} with summary`);
                pagesUpdated++;  // 更新成功，增加计数
            } catch (error) {
                console.error(`Error occurred while updating page ${pageId}:`, error);
            }
    }
}
    
    return `Updated ${pagesUpdated} Notion pages with summaries`;  // 返回更新的页面数
}  

handleRequest().then(result => console.log(result));  // 立即执行一次

setInterval(async function() {
    const result = await handleRequest();
    console.log(result);
}, intervalMinutes * 60 * 1000);  // 使用环境变量设置的间隔时间

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
