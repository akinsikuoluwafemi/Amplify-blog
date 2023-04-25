// pages/index.js
import { Authenticator } from "@aws-amplify/ui-react";
import { Amplify, API, Auth, withSSRContext } from "aws-amplify";
import Head from "next/head";
import { useState } from "react";
import awsExports from "../src/aws-exports";
import { createPost } from "../src/graphql/mutations";
import { listPosts } from "../src/graphql/queries";

Amplify.configure({ ...awsExports, ssr: true });

export async function getServerSideProps({ req }) {
  const SSR = withSSRContext({ req });

  try {
    const response = await SSR.API.graphql({
      query: listPosts,
      authMode: "API_KEY",
    });
    return {
      props: {
        posts: response.data.listPosts.items,
      },
    };
  } catch (err) {
    console.log(err);
    return {
      props: {},
    };
  }
}

async function handleCreatePost(event) {
  event.preventDefault();

  const form = new FormData(event.target);

  try {
    const { data } = await API.graphql({
      authMode: "AMAZON_COGNITO_USER_POOLS",
      query: createPost,
      variables: {
        input: {
          title: form.get("title"),
          content: form.get("content"),
        },
      },
    });

    window.location.href = `/posts/${data.createPost.id}`;
  } catch ({ errors }) {
    console.error(...errors);
    throw new Error(errors[0].message);
  }
}

export default function Home({ posts = [] }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  return (
    <div>
      <Head>
        <title>Amplify + Next.js</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>Amplify + Next.js</h1>

        <p>
          <code>{posts.length}</code>
          posts
        </p>

        <div>
          {posts.map((post) => (
            <a href={`/posts/${post.id}`} key={post.id}>
              <h3>{post.title}</h3>
              <p>{post.content}</p>
            </a>
          ))}

          <div>
            <h3>New Post</h3>

            <Authenticator>
              <form onSubmit={handleCreatePost}>
                <fieldset>
                  <legend>Title</legend>
                  <input
                    style={{ color: "black" }}
                    onChange={(e) => setTitle(e.target.value)}
                    defaultValue={`Today, ${new Date().toLocaleTimeString()}`}
                    name="title"
                    value={title}
                  />
                </fieldset>
                <fieldset>
                  <legend>Content</legend>
                  <textarea
                    onChange={(e) => setContent(e.target.value)}
                    defaultValue="I built an Amplify project with Next.js!"
                    name="content"
                    value={content}
                    style={{ color: "black" }}
                  />
                </fieldset>
                <button style={{ background: "green", padding: "5px" }}>
                  Create Post
                </button>{" "}
                <button
                  style={{ background: "red", padding: "5px" }}
                  type="button"
                  onClick={() => Auth.signOut()}
                >
                  Sign out
                </button>
              </form>
            </Authenticator>
          </div>
        </div>
      </main>
    </div>
  );
}
