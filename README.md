## 项目背景

作为一个大量使用Notion来保存网页内容以待阅读的用户，我发现自动总结内容的功能非常实用。虽然Notion AI提供了类似的功能，但是它每月需要10美元的费用。考虑到我已经在Azure和OpenAI的API上投入了大量资金，与此同时，Notion AI的其他功能我基本可以用Raycast来完成，所以我不希望再为这个功能付费。因此，我想，为什么不尝试使用CHATGPT自己来实现这个项目呢？可能是可以的。这个小项目花了我一周的时间来完成。虽然我是一个从来没有编程经验的文科生，但是确实依靠CHATGPT完成了这个小项目。我还是小小地感到骄傲的。

## 功能

这个项目可以自动从你指定的Notion数据库中提取内容，并使用OpenAI或Azure API生成摘要。然后，它会将摘要添加到每个页面的"Summary"列中。你可以设置脚本每隔多少分钟运行一次。

## 安装和使用

首先，你需要在你的系统上安装Node.js和npm。然后，你可以克隆这个仓库，并在项目的根目录下运行deploynotion.sh脚本。这个脚本会提示你输入你的API密钥和其他相关信息，并将这些信息保存到.env文件中。然后，脚本会安装所有必要的依赖，并启动应用。

## .env文件配置

你需要在.env文件中设置以下环境变量： NOTION_API_KEY: 你的Notion API密钥 OPENAI_API_KEY: 你的OpenAI API/ Azure OpenAI密钥 SUMMARIZATION_API: 你希望使用哪种服务作为你的总结工具？Openai还是Azure OpenAI？ DATABASE_IDS: 你想从中提取内容的Notion数据库ID，用逗号分隔 AZURE_API_BASE: 你的Azure API基础URL（如果你选择使用Azure作为摘要API） AZURE_API_VERSION: 你的Azure API版本（如果你选择使用Azure作为摘要API） AZURE_DEPLOYMENT_NAME: 你的Azure部署名称（如果你选择使用Azure作为摘要API） INTERVAL_MINUTES: 脚本应该每隔多少分钟运行一次

## 贡献

欢迎任何形式的贡献！如果你发现了一个bug，或者有一个功能请求，请开一个issue。如果你想直接为代码库做出贡献，你可以fork这个仓库，然后提交一个pull request。

## 致谢

我要感谢OpenAI的ChatGPT，没有它，我无法完成这个项目。CHATGPT帮助我延伸# Notion Summary Automation

## **许可证**

这个项目使用MIT许可证。

## **Background**

As a user who uses Notion extensively to save web content for later reading, I found the feature of automatic summarization extremely useful. Notion AI offers a similar feature, but it costs $10 per month. Considering that I have already invested a lot of money in Azure and OpenAI's APIs, and that I can basically use Raycast to complete other functions of Notion AI, I don't want to pay extra for this feature. So, I thought, why not try to implement this project myself with CHATGPT? It might be possible. This small project took me a week to complete. Although I am a liberal arts student with no programming experience, I did complete this small project with the help of CHATGPT. I am a little proud of that.

## **Features**

This project can automatically extract content from your specified Notion databases and generate summaries using OpenAI or Azure API. Then, it will add the summary to the "Summary" column of each page. You can set the script to run every few minutes.

## **Installation and Usage**

First, you need to install Node.js and npm on your system. Then, you can clone this repository and run the deploynotion.sh script in the root directory of the project. This script will prompt you to enter your API keys and other relevant information, and save these information to the .env file. Then, the script will install all necessary dependencies and start the application.

## **.env File Configuration**

You need to set the following environment variables in the .env file:

- NOTION_API_KEY: Your Notion API key
- OPENAI_API_KEY: Your OpenAI API/ Azure OpenAI key
- SUMMARIZATION_API: Which service do you want to use as your summarization tool? Openai or Azure OpenAI?
- DATABASE_IDS: The IDs of the Notion databases you want to extract content from, separated by commas
- AZURE_API_BASE: Your Azure API base URL (if you choose to use Azure as the summary API)
- AZURE_API_VERSION: Your Azure API version (if you choose to use Azure as the summary API)
- AZURE_DEPLOYMENT_NAME: Your Azure deployment name (if you choose to use Azure as the summary API)
- INTERVAL_MINUTES: How many minutes should the script run once

## **Contribution**

Any form of contribution is welcome! If you find a bug or have a feature request, please open an issue. If you want to contribute directly to the codebase, you can fork this repository and then submit a pull request.

## **Acknowledgement**

I want to thank OpenAI's ChatGPT, without it, I could not complete this project. CHATGPT has helped me extend my range of abilities, allowing me to take the first step in writing a program, which I didn't dare to think about before. Now this project is a real example of how an ordinary person can use AI to independently complete their own needs. Perhaps this is a trend for the future.

## **License**

This project is licensed under the MIT License. 
