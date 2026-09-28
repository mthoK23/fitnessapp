import React from "react";
import { Badges as badgesData } from './badgesData.js';
import './Badges.css';
import './badgeGallery.css';

function BadgeGallery({earnedBadges=[]}){
    return(
   <section className="badge-gallery" aria-label="Badge Gallery">
      {badgesData.map(badge => {
        const earned = earnedBadges.includes(badge.id);
        return (
          <li
            key={badge.id}
            className={`badge-card${earned ? " earned" : ""}`}
            title={badge.description}
          >
            <figure className="badge-icon-wrap">
              <span className="badge-icon">{badge.icon}</span>
              {earned && (
                <span className="badge-check" title="Earned!">✔</span>
              )}
            </figure>
            <section className="badge-info">
              <span className="badge-label">{badge.label}</span>
              <span className="badge-desc">{badge.description}</span>
            </section>
          </li>
        );
      })}
    </section>
  );
}

export default BadgeGallery;