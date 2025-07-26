import React from 'react';
import ReactDOM from 'react-dom/client';

function getQueryParam(param: string): string | null {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

function generateVCF() {
    const firstName = getQueryParam('fn');
    const email = getQueryParam('email');
    const phone = getQueryParam('tel');
    const organization = getQueryParam('org');
    const title = getQueryParam('title');

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
    const [contact, setContact] = React.useState({
        firstName: '',
        email: '',
        phone: '',
        organization: '',
        title: ''
    });

    React.useEffect(() => {
        const firstName = getQueryParam('fn') || '';
        const email = getQueryParam('email') || '';
        const phone = getQueryParam('tel') || '';
        const organization = getQueryParam('org') || '';
        const title = getQueryParam('title') || '';
        setContact({ firstName, email, phone, organization, title });
        generateVCF();
    }, []);

    return (
        <div className="container">
            <h1>VCF Card Generator & Contact Info Viewer</h1>
            <p>This page generates a VCF card and displays contact info based on the URL parameters.</p>
            <div style={{ margin: '1em 0', padding: '1em', border: '1px solid #ccc', borderRadius: '8px', maxWidth: '400px' }}>
                <h2>Contact Info</h2>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {contact.firstName && <li><strong>Name:</strong> {contact.firstName}</li>}
                    {contact.email && <li><strong>Email:</strong> {contact.email}</li>}
                    {contact.phone && <li><strong>Phone:</strong> {contact.phone}</li>}
                    {contact.organization && <li><strong>Organization:</strong> {contact.organization}</li>}
                    {contact.title && <li><strong>Title:</strong> {contact.title}</li>}
                    {!contact.firstName && !contact.email && !contact.phone && !contact.organization && !contact.title && (
                        <li>No contact info found in URL.</li>
                    )}
                </ul>
            </div>
            <p>Your VCF download should start automatically.</p>
        </div>
    );
}

const rootElement = document.getElementById('root');
if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(<App />);
}
