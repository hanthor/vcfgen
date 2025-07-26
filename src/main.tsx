import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import CryptoJS from 'crypto-js';

// Helper to get query parameters
function getQueryParam(param: string): string | null {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

interface ContactInfo {
    firstName: string;
    email: string;
    phone: string;
    organization: string;
    title: string;
}

// Function to encrypt contact data
function encryptContact(contact: ContactInfo, password: string): string {
    const jsonString = JSON.stringify(contact);
    const encrypted = CryptoJS.AES.encrypt(jsonString, password).toString();
    return encodeURIComponent(encrypted); // URL-safe encoding
}

// Function to decrypt contact data
function decryptContact(encryptedText: string, password: string): ContactInfo | null {
    try {
        const decodedText = decodeURIComponent(encryptedText);
        const decryptedBytes = CryptoJS.AES.decrypt(decodedText, password);
        const decryptedJsonString = decryptedBytes.toString(CryptoJS.enc.Utf8);
        if (!decryptedJsonString) {
            throw new Error("Decryption failed or incorrect password.");
        }
        return JSON.parse(decryptedJsonString) as ContactInfo;
    } catch (e) {
        console.error("Decryption error:", e);
        return null;
    }
}

// Function to generate VCF
function generateVCF(contact: ContactInfo) {
    const { firstName, email, phone, organization, title } = contact;

    if (!firstName && !email && !phone) {
        console.warn("No sufficient contact info to generate VCF.");
        return;
    }

    let vcard = `BEGIN:VCARD\nVERSION:3.0\n`;
    if (firstName) {
        vcard += `FN:${firstName}\nN:${firstName};;;\n`;
    }
    if (email) {
        vcard += `EMAIL:${email}\n`;
    }
    if (phone) {
        vcard += `TEL:${phone}\n`;
    }
    if (organization) {
        vcard += `ORG:${organization}\n`;
    }
    if (title) {
        vcard += `TITLE:${title}\n`;
    }
    vcard += `END:VCARD\n`;

    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${firstName || 'contact'}.vcf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function App() {
    // State for generating encrypted URL
    const [inputContact, setInputContact] = useState<ContactInfo>({
        firstName: '', email: '', phone: '', organization: '', title: ''
    });
    const [inputPassword, setInputPassword] = useState<string>('');
    const [generatedUrl, setGeneratedUrl] = useState<string>('');

    // State for decrypting from URL
    const [encryptedUrlParam, setEncryptedUrlParam] = useState<string | null>(null);
    const [decryptionPassword, setDecryptionPassword] = useState<string>('');
    const [decryptedContact, setDecryptedContact] = useState<ContactInfo | null>(null);
    const [showDecryptionForm, setShowDecryptionForm] = useState<boolean>(false);
    const [decryptionError, setDecryptionError] = useState<string>('');

    // Effect to check for encrypted data in URL on load
    useEffect(() => {
        const dataParam = getQueryParam('data');
        if (dataParam) {
            setEncryptedUrlParam(dataParam);
            setShowDecryptionForm(true);
        } else {
            // If no encrypted data, try to read direct params and generate VCF
            const directContact: ContactInfo = {
                firstName: getQueryParam('fn') || '',
                email: getQueryParam('email') || '',
                phone: getQueryParam('tel') || '',
                organization: getQueryParam('org') || '',
                title: getQueryParam('title') || ''
            };
            if (directContact.firstName || directContact.email || directContact.phone) {
                generateVCF(directContact);
            }
        }
    }, []);

    // Effect to generate VCF once decryptedContact is available
    useEffect(() => {
        if (decryptedContact) {
            generateVCF(decryptedContact);
        }
    }, [decryptedContact]);

    const handleGenerateUrl = () => {
        if (!inputPassword) {
            alert("Please enter a password to encrypt the data.");
            return;
        }
        if (!inputContact.firstName && !inputContact.email && !inputContact.phone) {
            alert("Please enter at least a first name, email, or phone to generate a vCard.");
            return;
        }
        const encrypted = encryptContact(inputContact, inputPassword);
        const currentBaseUrl = window.location.origin + window.location.pathname;
        setGeneratedUrl(`${currentBaseUrl}?data=${encrypted}`);
    };

    const handleDecryptSubmit = () => {
        if (!decryptionPassword) {
            setDecryptionError("Please enter a password to decrypt.");
            return;
        }
        if (encryptedUrlParam) {
            const contact = decryptContact(encryptedUrlParam, decryptionPassword);
            if (contact) {
                setDecryptedContact(contact);
                setDecryptionError('');
                setShowDecryptionForm(false); // Hide form on success
            } else {
                setDecryptionError("Incorrect password or corrupted data.");
            }
        }
    };

    return (
        <div className="container">
            <h1>VCF Card Generator & Contact Info Viewer</h1>

            {showDecryptionForm && encryptedUrlParam ? (
                <div style={{ margin: '1em 0', padding: '1em', border: '1px solid #ccc', borderRadius: '8px', maxWidth: '400px' }}>
                    <h2>Decrypt Contact Info</h2>
                    <p>This URL contains encrypted contact information. Please enter the password to view and download the vCard.</p>
                    <input
                        type="password"
                        placeholder="Enter password"
                        value={decryptionPassword}
                        onChange={(e) => setDecryptionPassword(e.target.value)}
                        style={{ width: '100%', padding: '8px', margin: '8px 0' }}
                    />
                    <button onClick={handleDecryptSubmit} style={{ padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                        Decrypt
                    </button>
                    {decryptionError && <p style={{ color: 'red' }}>{decryptionError}</p>}
                </div>
            ) : (
                <>
                    {decryptedContact ? (
                        <div style={{ margin: '1em 0', padding: '1em', border: '1px solid #ccc', borderRadius: '8px', maxWidth: '400px' }}>
                            <h2>Decrypted Contact Info</h2>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {decryptedContact.firstName && <li><strong>Name:</strong> {decryptedContact.firstName}</li>}
                                {decryptedContact.email && <li><strong>Email:</strong> {decryptedContact.email}</li>}
                                {decryptedContact.phone && <li><strong>Phone:</strong> {decryptedContact.phone}</li>}
                                {decryptedContact.organization && <li><strong>Organization:</strong> {decryptedContact.organization}</li>}
                                {decryptedContact.title && <li><strong>Title:</strong> {decryptedContact.title}</li>}
                            </ul>
                            <p>Your VCF download should start automatically.</p>
                        </div>
                    ) : (
                        // Display for direct URL params or initial state
                        <div style={{ margin: '1em 0', padding: '1em', border: '1px solid #ccc', borderRadius: '8px', maxWidth: '400px' }}>
                            <h2>Contact Info from URL</h2>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {getQueryParam('fn') && <li><strong>Name:</strong> {getQueryParam('fn')}</li>}
                                {getQueryParam('email') && <li><strong>Email:</strong> {getQueryParam('email')}</li>}
                                {getQueryParam('tel') && <li><strong>Phone:</strong> {getQueryParam('tel')}</li>}
                                {getQueryParam('org') && <li><strong>Organization:</strong> {getQueryParam('org')}</li>}
                                {getQueryParam('title') && <li><strong>Title:</strong> {getQueryParam('title')}</li>}
                                {!getQueryParam('fn') && !getQueryParam('email') && !getQueryParam('tel') && !getQueryParam('org') && !getQueryParam('title') && (
                                    <li>No contact info found in URL.</li>
                                )}
                            </ul>
                            { (getQueryParam('fn') || getQueryParam('email') || getQueryParam('tel')) && <p>Your VCF download should start automatically.</p>}
                        </div>
                    )}

                    {!(getQueryParam('fn') || getQueryParam('email') || getQueryParam('tel') || getQueryParam('org') || getQueryParam('title')) && (
                        <div style={{ marginTop: '2em', padding: '1em', border: '1px solid #ccc', borderRadius: '8px', maxWidth: '600px' }}>
                            <h2>Generate Encrypted VCF URL</h2>
                            <p>Enter contact details and a password to generate a URL with encrypted vCard information.</p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px', marginBottom: '10px' }}>
                                <label>First Name:</label>
                                <input type="text" value={inputContact.firstName} onChange={(e) => setInputContact({ ...inputContact, firstName: e.target.value })} />
                                <label>Email:</label>
                                <input type="email" value={inputContact.email} onChange={(e) => setInputContact({ ...inputContact, email: e.target.value })} />
                                <label>Phone:</label>
                                <input type="tel" value={inputContact.phone} onChange={(e) => setInputContact({ ...inputContact, phone: e.target.value })} />
                                <label>Organization:</label>
                                <input type="text" value={inputContact.organization} onChange={(e) => setInputContact({ ...inputContact, organization: e.target.value })} />
                                <label>Title:</label>
                                <input type="text" value={inputContact.title} onChange={(e) => setInputContact({ ...inputContact, title: e.target.value })} />
                                <label>Encryption Password:</label>
                                <input type="password" value={inputPassword} onChange={(e) => setInputPassword(e.target.value)} />
                            </div>
                            <button onClick={handleGenerateUrl} style={{ padding: '10px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                                Generate Encrypted URL
                            </button>
                            {generatedUrl && (
                                <div style={{ marginTop: '1em', wordBreak: 'break-all' }}>
                                    <p>Share this URL:</p>
                                    <a href={generatedUrl} target="_blank" rel="noopener noreferrer">{generatedUrl}</a>
                                    <button onClick={() => navigator.clipboard.writeText(generatedUrl)} style={{ marginLeft: '10px', padding: '5px 10px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>
                                        Copy URL
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

const rootElement = document.getElementById('root');
if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(<App />);
}
