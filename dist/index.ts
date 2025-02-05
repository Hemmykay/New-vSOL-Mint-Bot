import { Client, GatewayIntentBits, type Message, type TextChannel } from "discord.js"
import type { VercelRequest, VercelResponse } from "@vercel/node"
import axios from "axios"
import dotenv from "dotenv"

dotenv.config()

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
})
const BOT_PREFIX = process.env.BOT_PREFIX || "!"
const DEFAULT_TOKEN_ADDRESS = process.env.DEFAULT_TOKEN_ADDRESS
const CHANNEL_ID = process.env.CHANNEL_ID
const HELIUS_API_KEY = process.env.HELIUS_API_KEY

const EXCITEMENT_RANGE_1 = Number(process.env.EXCITEMENT_RANGE_1) || 100
const EXCITEMENT_RANGE_2 = Number(process.env.EXCITEMENT_RANGE_2) || 500
const EXCITEMENT_RANGE_3 = Number(process.env.EXCITEMENT_RANGE_3) || 1000
const IGNORE_RANGE = Number(process.env.IGNORE_RANGE) || 0

let currentSupply: number | null = null

// Helper function to format numbers with commas and 2 decimal places
function formatNumber(num: number): string {
  return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// Function to generate a dynamic minting message based on excitement level
function generateMintingMessage(amount: number): string {
  let messages: string[]

  if (amount >= EXCITEMENT_RANGE_3) {
    messages = [
      `🚀🚀🚀 INCREDIBLE! A massive **${formatNumber(amount)} $vSOL** just minted to The vault! This is HUGE!`,
      `🎉🎉🎉 PHENOMENAL NEWS! **${formatNumber(amount)} $vSOL** has been minted! The community is THRIVING!`,
      `⚡⚡⚡ MIND-BLOWING! **${formatNumber(amount)} $vSOL** has just been minted!`,
    ]
  } else if (amount >= EXCITEMENT_RANGE_2) {
    messages = [
      `🚀🚀 Major deployment detected! **${formatNumber(amount)} $vSOL** just entered the vault!`,
      `🎉🎉 Wow! An impressive **${formatNumber(amount)} $vSOL** has been minted! This is big!`,
      `⚡⚡ Alert! **${formatNumber(amount)} $vSOL** has arrived! The community is growing fast!`,
    ]
  } else if (amount >= EXCITEMENT_RANGE_1) {
    messages = [
      `🚀 Nice! **${formatNumber(amount)} $vSOL** has been added to the vault!`,
      `🎉 Exciting times! **${formatNumber(amount)} $vSOL** just minted!`,
      `⚡ Heads up! **${formatNumber(amount)} $vSOL** has been freshly minted!`,
    ]
  } else {
    messages = [
      `A new recruit minted **${formatNumber(amount)} $vSOL**!`,
      `**${formatNumber(amount)} $vSOL** has arrived on the scene!`,
      `Welcome aboard! **${formatNumber(amount)} $vSOL** just minted!`,
    ]
  }

  const randomIndex = Math.floor(Math.random() * messages.length)
  return messages[randomIndex]
}

client.on("ready", () => {
  console.log(`Logged in as ${client.user?.tag}!`)
  startSupplyCheck()
})

client.on("messageCreate", async (message: Message) => {
  if (message.author.bot) return

  if (message.content.startsWith(`${BOT_PREFIX}supply`)) {
    if (currentSupply === null) {
      message.reply("Current supply not yet set. Please wait a few seconds.")
      return
    }

    message.reply(`Current Supply: **${formatNumber(currentSupply)} $vSOL**`)
  }
})

async function getTokenSupply(tokenAddress: string): Promise<number> {
  const response = await axios.post(
    `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`,
    {
      jsonrpc: "2.0",
      id: 1,
      method: "getTokenSupply",
      params: [tokenAddress],
    },
    {
      headers: { "Content-Type": "application/json" },
    },
  )

  if (response.data.error) {
    throw new Error(response.data.error.message)
  }

  return Number(response.data.result.value.uiAmount.toFixed(2))
}

async function startSupplyCheck() {
  setInterval(async () => {
    try {
      if (!DEFAULT_TOKEN_ADDRESS) {
        console.error("Default token address not set")
        return
      }

      const newSupply = await getTokenSupply(DEFAULT_TOKEN_ADDRESS)

      if (currentSupply !== null) {
        const change = Number((newSupply - currentSupply).toFixed(2))
        if (change >= IGNORE_RANGE) {
          const channel = client.channels.cache.get(CHANNEL_ID!) as TextChannel
          if (channel) {
            const message = generateMintingMessage(change)
            channel.send(message)
          } else {
            console.error("Channel not found")
          }
        } else {
          console.log(`Minted amount (${formatNumber(change)} vSOL) below IGNORE_RANGE. No message sent.`)
        }
      } else {
        console.log("Initial Supply Set:", formatNumber(newSupply))
      }

      currentSupply = newSupply
      console.log(`Current Token Supply: ${formatNumber(currentSupply)}`)
    } catch (error) {
      console.error("Error checking supply:", error)
    }
  }, 30000)
}

client.login(process.env.DISCORD_TOKEN)

export default async function handler(req: any, res: any) {
  if (!client.isReady()) {
    await client.login(process.env.DISCORD_TOKEN)
  }
  res.status(200).end("Bot is running")
}