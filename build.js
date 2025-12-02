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

    // 2. Build Home Page
    console.log('Building Home page...');
    const posts = getPosts();
    const indexTemplate = fs.readFileSync(path.join(viewsDir, 'index.ejs'), 'utf-8');
    const indexHtml = ejs.render(indexTemplate, {
        posts,
        title: "Dulkanggg's Corner",
        filename: path.join(viewsDir, 'index.ejs') // Required for include to work
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
            filename: path.join(viewsDir, 'post.ejs')
        });

        fs.writeFileSync(path.join(postDir, 'index.html'), postHtml);
    });

    console.log('Build complete! Output in dist/');
}

build();
