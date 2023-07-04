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
