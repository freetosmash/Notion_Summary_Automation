#!/bin/bash
# 下载JavaScript文件
curl https://raw.githubusercontent.com/freetosmash/Notion_Summary_Automation/main/notion_automation.js -o notion_automation.js

read -p "Enter your Notion API key: " notionApiKey
read -p "Enter your OpenAI/Azure OpenAI API key: " openaiApiKey
read -p "Enter the summarization API (openai or azure): " summarizationApi
echo "Enter the database IDs (press enter when finished):"
databaseIds=""
while true; do
    read databaseId
    if [ -z "$databaseId" ]; then
        break
    fi
    databaseIds+="$databaseId,"
done
databaseIds=${databaseIds%?}
read -p "Enter the port (default 3000): " port
read -p "Enter the interval in minutes (default 30): " intervalMinutes

echo "NOTION_API_KEY=$notionApiKey" > .env
echo "OPENAI_API_KEY=$openaiApiKey" >> .env
echo "DATABASE_IDS=$databaseIds" >> .env
echo "PORT=${port:-3000}" >> .env
echo "INTERVAL_MINUTES=${intervalMinutes:-30}" >> .env

if [ "$summarizationApi" == "azure" ]; then
    read -p "Enter your Azure API base URL: " azureApiBase
    read -p "Enter your Azure API version: " azureApiVersion
    read -p "Enter your Azure Deployment Name: " azureDeploymentName
    echo "AZURE_API_BASE=$azureApiBase" >> .env
    echo "AZURE_API_VERSION=$azureApiVersion" >> .env
    echo "AZURE_DEPLOYMENT_NAME=$azureDeploymentName" >> .env
fi

echo "The .env file has been created."
echo "NOTION_API_KEY=$notionApiKey"
echo "OPENAI_API_KEY=$openaiApiKey"
echo "AZURE_API_BASE=$azureApiBase"
echo "AZURE_API_VERSION=$azureApiVersion"
echo "AZURE_DEPLOYMENT_NAME=$azureDeploymentName"
echo "DATABASE_IDS=$databaseIds"
echo "PORT=${port:-3000}"
echo "INTERVAL_MINUTES=${intervalMinutes:-30}"
echo ""

# 安装项目依赖
echo "Installing dependencies..."
npm install @azure/openai @notionhq/client dotenv express node-fetch

node notion_automation.js
