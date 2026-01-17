# NPM Publishing Guide - v2.1.0

## Pre-Publishing Checklist

✅ **Package Configuration**
- [x] Version updated to 2.1.0
- [x] `.npmignore` file created
- [x] `files` field added to package.json
- [x] All tests passing (28/28)
- [x] Package structure verified

✅ **Package Contents** (verified with `npm pack --dry-run`)
- LICENSE (35.8kB)
- README.md (17.5kB)
- index.js (107B)
- package.json (1.7kB)
- src/cases.js (10.6kB)
- src/constants.js (6.8kB)
- src/index.js (7.0kB)
- src/transliteration.js (1.5kB)
- src/utils.js (5.7kB)
- src/validation.js (1.2kB)

**Total Package Size**: 26.3 kB (unpacked: 87.8 kB)

---

## Publishing Steps

### 1. Login to NPM

If you're not already logged in:

```bash
npm login
```

You'll be prompted for:
- Username
- Password
- Email
- One-time password (if 2FA is enabled)

**Verify login:**
```bash
npm whoami
```

### 2. Verify Package Name Availability

Check if the package name is available (it should be, since you own it):
```bash
npm view greek-name-correction
```

### 3. Final Verification

Run a dry-run to see exactly what will be published:
```bash
npm pack --dry-run
```

Or create the tarball to inspect:
```bash
npm pack
# This creates: greek-name-correction-2.1.0.tgz
```

### 4. Publish to NPM

**For public release:**
```bash
npm publish
```

**For scoped package or private registry:**
```bash
npm publish --access public
```

### 5. Verify Publication

After publishing, verify on npmjs.com:
- Visit: https://www.npmjs.com/package/greek-name-correction
- Check version 2.1.0 appears
- Verify package contents

**Or via CLI:**
```bash
npm view greek-name-correction version
npm view greek-name-correction versions
```

---

## Post-Publishing

### 1. Create GitHub Release

1. Go to: https://github.com/sraftopo/GreekNameCorrection/releases/new
2. Tag: `v2.1.0`
3. Title: `v2.1.0 - Modular Architecture`
4. Description: Copy content from `RELEASE_NOTES_2.1.0.md`
5. Publish release

### 2. Update Documentation

- [x] README.md already updated
- [x] CHANGELOG.md created
- [x] RELEASE_NOTES_2.1.0.md created

### 3. Announce (Optional)

- Update package description on npm
- Share on social media
- Update any related documentation

---

## Troubleshooting

### Error: "You must verify your email"
```bash
# Check your email and verify, then retry
npm publish
```

### Error: "Package name already exists"
- This is normal if updating an existing package
- Make sure version number is incremented (2.1.0)

### Error: "Unauthorized"
```bash
# Re-login
npm login
```

### Error: "Version already exists"
- Version 2.1.0 is already published
- Increment version in package.json if needed

---

## Rollback (if needed)

If you need to unpublish (within 72 hours):
```bash
npm unpublish greek-name-correction@2.1.0
```

**Note**: Only use if absolutely necessary. Consider using a patch version instead.

---

## Next Steps After Publishing

1. ✅ Test installation:
   ```bash
   npm install greek-name-correction@2.1.0
   ```

2. ✅ Verify in a new project:
   ```bash
   mkdir test-install
   cd test-install
   npm init -y
   npm install greek-name-correction@2.1.0
   node -e "const GNC = require('greek-name-correction'); console.log(GNC('γιώργος παπαδόπουλος'));"
   ```

3. ✅ Monitor npm downloads and feedback

---

## Package Information

- **Name**: greek-name-correction
- **Version**: 2.1.0
- **Registry**: https://registry.npmjs.org/
- **Package URL**: https://www.npmjs.com/package/greek-name-correction
- **GitHub**: https://github.com/sraftopo/greek-name-correction

---

**Ready to publish!** 🚀
