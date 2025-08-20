This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

```
docker build -t ml-client .

docker run -e NEXT_PUBLIC_API_URL=https://your-api-url.com -p 3000:3000
  ml-client
```

NOTE: The api url should be the tunnel api url
