#!/bin/bash
# 下载JavaScript文件
curl https://raw.githubusercontent.com/freetosmash/Notion_Summary_Automation/main/notion_automation.js -o notion_automation.js


read -p "Enter your Notion API key: " notionApiKey
read -p "Enter your OpenAI API key: " openaiApiKey
read -p "Enter the summarization API (openai or azure): " summarizationApi

if [ "$summarizationApi" == "azure" ]; then
    read -p "Enter your Azure API base URL: " azureApiBase
    read -p "Enter your Azure API version: " azureApiVersion
fi

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
echo "SUMMARIZATION_API=$summarizationApi" >> .env
if [ "$summarizationApi" == "azure" ]; then
    echo "AZURE_API_BASE=$azureApiBase" >> .env
    echo "AZURE_API_VERSION=$azureApiVersion" >> .env
fi
echo "DATABASE_IDS=$databaseIds" >> .env
echo "PORT=$port" >> .env
echo "INTERVAL_MINUTES=$intervalMinutes" >> .env

echo "The .env file has been created."
