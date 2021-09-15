import { client } from "../../lib/discord";

const MSG = "**⚠️ WARNING**\nThis is not a Roblox server and we'll not attend you. If you're trying to build desktop apps with web technologies, please ignore this message."

client.on("message", (msg) => {
    const normalizedMsg = msg.toLowerCase().split(" ")
    // When ALL are present, send a message
    const isElectronWordIncluded = normalizedMsg.includes("electron")
    const isInstallWordIncluded = normalizedMsg.includes("install")
    if (isElectronWordIncluded && isInstallWordIncluded) {
        msg.channel.send(MSG)
    }
    // Some people use the .download button to try to get a download link
    if (msg.startsWith(".download")) {
        msg.channel.send(MSG)
    }
})