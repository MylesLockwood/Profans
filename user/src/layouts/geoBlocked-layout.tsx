/* eslint-disable react/no-unescaped-entities */
import { FunctionComponent } from 'react';

const GEOLayout: FunctionComponent<any> = () => (
  <main role="main">
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      justifyContent: 'center',
      alignItems: 'center',
      background: `radial-gradient(ellipse at top, #e66465, transparent),
            radial-gradient(ellipse at bottom, #4d9f0c, transparent)`
    }}
    >
      <h1 style={{ fontSize: '30px' }}>We've sorry.</h1>
      <h3 style={{ fontSize: '27px' }}>Website content is not available on your country</h3>
    </div>
  </main>
);

export default GEOLayout;
