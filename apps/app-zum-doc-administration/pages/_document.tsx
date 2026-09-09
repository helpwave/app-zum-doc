import Document, { Head, Html, Main, NextScript } from 'next/document'

class AdministrationDocument extends Document {
  render() {
    return (
      <Html lang="de">
        <Head>
          <link rel="icon" href="/favicon.png" />
          <meta name="theme-color" content="#057986" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default AdministrationDocument
