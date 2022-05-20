import React from 'react';
import classNames from 'classnames';
import styles from './index.less';
export default ({ className, links, copyright, wxcode }) => {
  const clsString = classNames(styles.globalFooter, className);
  return (

    <div className={clsString}>
      {/* {wxcode && <img height="140" width="140" src="http://localhost:8000/public/erweima.png" />} */}
      {/* {links && (
        <div className={styles.links}>
          {links.map(link => (
            <a key={link.key} target={link.blankTarget ? '_blank' : '_self'} href={link.href}>
              {link.title}
            </a>
          ))}
        </div>
      )} */}
      {/* {copyright && <div className={styles.copyright}>{copyright}</div>} */}
    </div>
  );
};
