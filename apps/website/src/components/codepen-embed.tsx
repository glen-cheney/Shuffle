import React from 'react';
import styles from './codepen-embed.module.css';

const author = 'Glen Cheney';

interface CodePenEmbedProps {
  penTitle: string;
  penId: string;
  penUser: string;
}

export const CodePenEmbed: React.FC<CodePenEmbedProps> = ({ penTitle, penId, penUser }) => (
  <div>
    <iframe
      height={500}
      className={styles.iframe}
      title={penTitle}
      src={`https://codepen.io/${penUser}/embed/${penId}?default-tab=result`}
      loading="eager"
      sandbox="allow-forms allow-scripts"
      allowFullScreen
    >
      See the Pen <a href={`https://codepen.io/${penUser}/pen/${penId}`}>{penTitle}</a> by {author} (
      <a href={`https://codepen.io/${penUser}`}>@{penUser}</a>) on <a href="https://codepen.io">CodePen</a>.
    </iframe>
  </div>
);
