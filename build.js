const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const frontMatter = require('front-matter');
const marked = require('marked');

const distDir = path.join(__dirname, 'dist');
const viewsDir = path.join(__dirname, 'views');
const publicDir = path.join(__dirname, 'public');
const postsDir = path.join(__dirname, 'posts');

// Ensure dist directory exists
if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir);

// Helper: Copy directory
function copyDir(src, dest) {
    fs.mkdirSync(dest, { recursive: true });
    let entries = fs.readdirSync(src, { withFileTypes: true });

    for (let entry of entries) {
        let srcPath = path.join(src, entry.name);
        let destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

// Helper: Get Posts
const getPosts = () => {
    const files = fs.readdirSync(postsDir);
    const posts = files.map(filename => {
        const content = fs.readFileSync(path.join(postsDir, filename), 'utf-8');
        const { attributes, body } = frontMatter(content);
        return {
            slug: filename.replace('.md', ''),
            ...attributes,
            body
        };
    });
    return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
};

// Build
async function build() {
    console.log('Starting build...');

    // 1. Copy Public Assets
    console.log('Copying assets...');
    copyDir(publicDir, distDir);
    fs.writeFileSync(path.join(distDir, '.nojekyll'), '');

    // 2. Build Home Page
    console.log('Building Home page...');
    const posts = getPosts();
    const indexTemplate = fs.readFileSync(path.join(viewsDir, 'index.ejs'), 'utf-8');
    const indexHtml = ejs.render(indexTemplate, {
        posts,
        title: "Dulkanggg's Corner",
        filename: path.join(viewsDir, 'index.ejs'), // Required for include to work
        basePath: '/dulkanggg'
    });
    fs.writeFileSync(path.join(distDir, 'index.html'), indexHtml);

    // 3. Build Post Pages
    console.log('Building Post pages...');
    const postTemplate = fs.readFileSync(path.join(viewsDir, 'post.ejs'), 'utf-8');

    posts.forEach(post => {
        const postDir = path.join(distDir, 'post', post.slug);
        fs.mkdirSync(postDir, { recursive: true });

        const htmlContent = marked.parse(post.body);
        const postHtml = ejs.render(postTemplate, {
            post: { ...post, htmlContent },
            title: post.title,
            filename: path.join(viewsDir, 'post.ejs'),
            basePath: '/dulkanggg'
        });

        fs.writeFileSync(path.join(postDir, 'index.html'), postHtml);
    });

    // 4. Build Search Page & Index
    console.log('Building Search page & Index...');
    const searchTemplate = fs.readFileSync(path.join(viewsDir, 'search.ejs'), 'utf-8');
    const searchHtml = ejs.render(searchTemplate, {
        title: "Search - Dulkanggg's Corner",
        filename: path.join(viewsDir, 'search.ejs'),
        basePath: '/dulkanggg'
    });
    fs.writeFileSync(path.join(distDir, 'search.html'), searchHtml);

    // 5. Build About Page
    console.log('Building About page...');
    const aboutTemplate = fs.readFileSync(path.join(viewsDir, 'about.ejs'), 'utf-8');
    const aboutHtml = ejs.render(aboutTemplate, {
        title: "About - Dulkanggg's Corner",
        filename: path.join(viewsDir, 'about.ejs'),
        basePath: '/dulkanggg'
    });
    fs.writeFileSync(path.join(distDir, 'about.html'), aboutHtml);

    // Create search.json
    // We strip markdown to keep the file size reasonable if needed, but for now raw body is okay or just strip it slightly
    const searchIndex = posts.map(post => ({
        title: post.title,
        slug: post.slug,
        date: post.date,
        tags: post.tags,
        body: post.body // Include full body for full-text search
    }));
    fs.writeFileSync(path.join(distDir, 'search.json'), JSON.stringify(searchIndex));

    console.log('Build complete! Output in dist/');
}

build();
