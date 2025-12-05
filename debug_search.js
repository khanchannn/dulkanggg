const fs = require('fs');
const path = require('path');
const frontMatter = require('front-matter');

const postsDir = path.join(__dirname, 'posts');

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

try {
    const posts = getPosts();
    const searchIndex = posts.map(post => ({
        title: post.title,
        slug: post.slug,
        date: post.date,
        tags: post.tags,
        body: post.body
    }));

    console.log("Successfully generated search index.");
    console.log("Number of posts:", searchIndex.length);
    console.log("First post title:", searchIndex[0].title);

    // Check for undefined values
    searchIndex.forEach((item, index) => {
        if (!item.title) console.error(`Post ${index} missing title`);
        if (!item.body) console.error(`Post ${index} missing body`);
        if (!item.slug) console.error(`Post ${index} missing slug`);
    });

    const json = JSON.stringify(searchIndex, null, 2);
    console.log("JSON length:", json.length);
    // console.log(json); 
} catch (error) {
    console.error("Error generating search index:", error);
}
