import Document, {
  Html, Head, Main, NextScript
} from 'next/document';
import { settingService } from '@services/setting.service';

class CustomDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    const resp = await settingService.all();
    const settings = resp.data;
    return {
      ...initialProps,
      settings
    };
  }

  render() {
    const { settings } = this.props as any;
    return (
      <Html>
        <Head>
          <link rel="icon" href={settings.favicon || '/static/favicon.ico'} sizes="64x64" />
          <meta name="keywords" content={settings && settings.metaKeywords} />
          <meta
            name="description"
            content={settings && settings.metaDescription}
          />
          {/* OG tags */}
          <meta
            property="og:title"
            content={settings && settings.siteName}
            key="title"
          />
          <meta property="og:image" content={settings && settings.logoUrl} />
          <meta
            property="og:keywords"
            content={settings && settings.metaKeywords}
          />
          <meta
            property="og:description"
            content={settings && settings.metaDescription}
          />
          {/* GA code */}
          {settings && settings.gaCode && [
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${settings.gaCode}`} />,
            <script
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{
                __html: `
                 window.dataLayer = window.dataLayer || [];
                 function gtag(){dataLayer.push(arguments);}
                 gtag('js', new Date());
                 gtag('config', '${settings.gaCode}');
             `
              }}
            />
          ]}
          {/* extra script */}
          {settings && settings.headerScript && (
            // eslint-disable-next-line react/no-danger
            <div dangerouslySetInnerHTML={{ __html: settings.headerScript }} />
          )}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
        {/* extra script */}
        {settings && settings.afterBodyScript && (
          // eslint-disable-next-line react/no-danger
          <div dangerouslySetInnerHTML={{ __html: settings.afterBodyScript }} />
        )}
      </Html>
    );
  }
}

export default CustomDocument;
