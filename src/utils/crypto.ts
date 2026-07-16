const LOCAL_KEY_NAME = 'ihsanos_inst_key'

// Get or generate a stable passphrase for this installation
function getOrCreatePassphrase(): string {
  let key = localStorage.getItem(LOCAL_KEY_NAME)
  if (!key) {
    const array = new Uint8Array(32)
    window.crypto.getRandomValues(array)
    key = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
    localStorage.setItem(LOCAL_KEY_NAME, key)
  }
  return key
}

// Derive a CryptoKey from the passphrase using PBKDF2
async function deriveKey(passphrase: string): Promise<CryptoKey> {
  const enc = new TextEncoder()
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  )
  
  const salt = enc.encode('ihsanos_encryption_salt')
  
  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

// Rotates/regenerates the installation key (factory reset trigger)
export function rotateEncryptionKey(): void {
  localStorage.removeItem(LOCAL_KEY_NAME)
  getOrCreatePassphrase()
}

// Encrypt plainText to Base64 IV:CipherText
export async function encryptToken(plainText: string): Promise<string> {
  if (!plainText) return ''
  try {
    const passphrase = getOrCreatePassphrase()
    const key = await deriveKey(passphrase)
    const enc = new TextEncoder()
    const iv = window.crypto.getRandomValues(new Uint8Array(12))
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      enc.encode(plainText)
    )
    
    const ivBase64 = btoa(String.fromCharCode(...iv))
    const ctBase64 = btoa(String.fromCharCode(...new Uint8Array(encrypted)))
    return `${ivBase64}:${ctBase64}`
  } catch (err) {
    console.error('[Crypto] Encryption failed:', err)
    throw err
  }
}

// Decrypt encrypted ciphertext Base64 to plainText
export async function decryptToken(cipherText: string): Promise<string> {
  if (!cipherText) return ''
  try {
    const parts = cipherText.split(':')
    if (parts.length !== 2) throw new Error('Invalid cipher format')
    
    const ivBytes = new Uint8Array(atob(parts[0]).split('').map(c => c.charCodeAt(0)))
    const ctBytes = new Uint8Array(atob(parts[1]).split('').map(c => c.charCodeAt(0)))
    
    const passphrase = getOrCreatePassphrase()
    const key = await deriveKey(passphrase)
    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: ivBytes },
      key,
      ctBytes
    )
    
    return new TextDecoder().decode(decrypted)
  } catch (err) {
    console.error('[Crypto] Decryption failed:', err)
    throw err
  }
}
