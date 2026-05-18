const crypto = require("crypto");
const algorithm = "aes-256-cbc";

const encrypt = (text) => {
  if (!text) return text;
  try {
    const iv = crypto.randomBytes(16);
    const key = Buffer.from(process.env.ENCRYPTION_KEY, "hex");
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return `${iv.toString("hex")}:${encrypted}`;
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Failed to encrypt data");
  }
};

const decrypt = (hash) => {
  if (!hash) return hash;
  try {
    const parts = hash.split(":");
    if (parts.length !== 2) return null;
    const iv = Buffer.from(parts[0], "hex");
    const encryptedText = parts[1];
    const key = Buffer.from(process.env.ENCRYPTION_KEY, "hex");
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error);
    return null;
  }
};

module.exports = { encrypt, decrypt };
