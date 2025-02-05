"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var discord_js_1 = require("discord.js");
var axios_1 = require("axios");
var dotenv_1 = require("dotenv");
dotenv_1.config();
var client = new discord_js_1.Client({
    intents: [discord_js_1.GatewayIntentBits.Guilds, discord_js_1.GatewayIntentBits.GuildMessages, discord_js_1.GatewayIntentBits.MessageContent],
});
var BOT_PREFIX = process.env.BOT_PREFIX || "!";
var DEFAULT_TOKEN_ADDRESS = process.env.DEFAULT_TOKEN_ADDRESS;
var CHANNEL_ID = process.env.CHANNEL_ID;
var HELIUS_API_KEY = process.env.HELIUS_API_KEY;
var EXCITEMENT_RANGE_1 = Number(process.env.EXCITEMENT_RANGE_1) || 100;
var EXCITEMENT_RANGE_2 = Number(process.env.EXCITEMENT_RANGE_2) || 500;
var EXCITEMENT_RANGE_3 = Number(process.env.EXCITEMENT_RANGE_3) || 1000;
var IGNORE_RANGE = Number(process.env.IGNORE_RANGE) || 0;
var currentSupply = null;
// Helper function to format numbers with commas and 2 decimal places
function formatNumber(num) {
    return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
// Function to generate a dynamic minting message based on excitement level
function generateMintingMessage(amount) {
    var messages;
    if (amount >= EXCITEMENT_RANGE_3) {
        messages = [
            "\uD83D\uDE80\uD83D\uDE80\uD83D\uDE80 INCREDIBLE! A massive **".concat(formatNumber(amount), " $vSOL** just minted to The vault! This is HUGE!"),
            "\uD83C\uDF89\uD83C\uDF89\uD83C\uDF89 PHENOMENAL NEWS! **".concat(formatNumber(amount), " $vSOL** has been minted! The community is THRIVING!"),
            "\u26A1\u26A1\u26A1 MIND-BLOWING! **".concat(formatNumber(amount), " $vSOL** has just been minted!"),
        ];
    }
    else if (amount >= EXCITEMENT_RANGE_2) {
        messages = [
            "\uD83D\uDE80\uD83D\uDE80 Major deployment detected! **".concat(formatNumber(amount), " $vSOL** just entered the vault!"),
            "\uD83C\uDF89\uD83C\uDF89 Wow! An impressive **".concat(formatNumber(amount), " $vSOL** has been minted! This is big!"),
            "\u26A1\u26A1 Alert! **".concat(formatNumber(amount), " $vSOL** has arrived! The community is growing fast!"),
        ];
    }
    else if (amount >= EXCITEMENT_RANGE_1) {
        messages = [
            "\uD83D\uDE80 Nice! **".concat(formatNumber(amount), " $vSOL** has been added to the vault!"),
            "\uD83C\uDF89 Exciting times! **".concat(formatNumber(amount), " $vSOL** just minted!"),
            "\u26A1 Heads up! **".concat(formatNumber(amount), " $vSOL** has been freshly minted!"),
        ];
    }
    else {
        messages = [
            "A new recruit minted **".concat(formatNumber(amount), " $vSOL**!"),
            "**".concat(formatNumber(amount), " $vSOL** has arrived on the scene!"),
            "Welcome aboard! **".concat(formatNumber(amount), " $vSOL** just minted!"),
        ];
    }
    var randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex];
}
client.on("ready", function () {
    var _a;
    console.log("Logged in as ".concat((_a = client.user) === null || _a === void 0 ? void 0 : _a.tag, "!"));
    startSupplyCheck();
});
client.on("messageCreate", function (message) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        if (message.author.bot)
            return [2 /*return*/];
        if (message.content.startsWith("".concat(BOT_PREFIX, "supply"))) {
            if (currentSupply === null) {
                message.reply("Current supply not yet set. Please wait a few seconds.");
                return [2 /*return*/];
            }
            message.reply("Current Supply: **".concat(formatNumber(currentSupply), " $vSOL**"));
        }
        return [2 /*return*/];
    });
}); });
function getTokenSupply(tokenAddress) {
    return __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, axios_1.default.post("https://mainnet.helius-rpc.com/?api-key=".concat(HELIUS_API_KEY), {
                        jsonrpc: "2.0",
                        id: 1,
                        method: "getTokenSupply",
                        params: [tokenAddress],
                    }, {
                        headers: { "Content-Type": "application/json" },
                    })];
                case 1:
                    response = _a.sent();
                    if (response.data.error) {
                        throw new Error(response.data.error.message);
                    }
                    return [2 /*return*/, Number(response.data.result.value.uiAmount.toFixed(2))];
            }
        });
    });
}
function startSupplyCheck() {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
                var newSupply, change, channel, message, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            if (!DEFAULT_TOKEN_ADDRESS) {
                                console.error("Default token address not set");
                                return [2 /*return*/];
                            }
                            return [4 /*yield*/, getTokenSupply(DEFAULT_TOKEN_ADDRESS)];
                        case 1:
                            newSupply = _a.sent();
                            if (currentSupply !== null) {
                                change = Number((newSupply - currentSupply).toFixed(2));
                                if (change >= IGNORE_RANGE) {
                                    channel = client.channels.cache.get(CHANNEL_ID);
                                    if (channel) {
                                        message = generateMintingMessage(change);
                                        channel.send(message);
                                    }
                                    else {
                                        console.error("Channel not found");
                                    }
                                }
                                else {
                                    console.log("Minted amount (".concat(formatNumber(change), " vSOL) below IGNORE_RANGE. No message sent."));
                                }
                            }
                            else {
                                console.log("Initial Supply Set:", formatNumber(newSupply));
                            }
                            currentSupply = newSupply;
                            console.log("Current Token Supply: ".concat(formatNumber(currentSupply)));
                            return [3 /*break*/, 3];
                        case 2:
                            error_1 = _a.sent();
                            console.error("Error checking supply:", error_1);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); }, 30000);
            return [2 /*return*/];
        });
    });
}
client.login(process.env.DISCORD_TOKEN);
