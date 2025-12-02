const express = require('express');
const path = require('path');
const fs = require('fs');
const marked = require('marked');
const frontMatter = require('front-matter');

const app = express();
const PORT = process.env.PORT || 3000;

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Helper function to get all posts
const getPosts = () => {
    const postsDir = path.join(__dirname, 'posts');
    const files = fs.readdirSync(postsDir);
    const posts = files.map(filename => {
        const content = fs.readFileSync(path.join(postsDir, filename), 'utf-8');
        const { attributes, body } = frontMatter(content);
        const slug = filename.replace('.md', '')
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, '-') // Replace non-alphanumeric chars with hyphens
            .replace(/-+/g, '-')         // Replace multiple hyphens with single hyphen
            .replace(/^-|-$/g, '');      // Trim hyphens

        return {
            slug,
            ...attributes,
            body
        };
    });
    // Sort by date descending
    return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
};

// Routes

// Home
app.get('/', (req, res) => {
    const posts = getPosts();
    res.render('index', { posts, title: "Dulkanggg's Corner", basePath: '' });
});

// Post Detail
app.get('/post/:slug', (req, res) => {
    const posts = getPosts();
    const post = posts.find(p => p.slug === req.params.slug);
    if (!post) return res.status(404).send('Post not found');

    const htmlContent = marked.parse(post.body);
    res.render('post', { post: { ...post, htmlContent }, title: post.title, basePath: '' });
});

// Tags
app.get('/tags/:tag', (req, res) => {
    const posts = getPosts();
    const tag = req.params.tag;
    const filteredPosts = posts.filter(p => p.tags && p.tags.includes(tag));
    res.render('index', { posts: filteredPosts, title: `Tag: ${tag}`, basePath: '' });
});

// Search (Simple implementation)
app.get('/search', (req, res) => {
    const query = req.query.q ? req.query.q.toLowerCase() : '';
    const posts = getPosts();
    const filteredPosts = posts.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.body.toLowerCase().includes(query)
    );
    res.render('index', { posts: filteredPosts, title: `Search: ${query}` });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
