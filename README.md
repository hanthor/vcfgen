# Client-side vCard generator and Contact viewer

This should take a URL and generate a vCard from it and download it. This is useful since iOS doesn't support downloading vCard directly from QR Codes and NFC tags.

## Running

```
npm install
npm run dev
```

go to http://localhost:5173/index.html?fn=John%20Doe&email=john@example.com&tel=1234567890&org=Acme%20Inc&title=Engineer


# TODO

- [ ] style the viewer with some branding or something
- [ ] add support for all the field we want
- [ ] make a URL generator (a form with a URL generator)
