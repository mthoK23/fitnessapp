import { BADGES } from "../data/badges";

export default function BadgeGallery({ earnedBadges }) {
  return (
    <section className="badge-gallery">
      {BADGES.map(badge => (
        <section
          key={badge.id}
          className={`badge-card${earnedBadges.includes(badge.id) ? " earned" : ""}`}
          title={badge.description}
        >
          <span className="badge-icon">{badge.icon}</span>
          <span className="badge-label">{badge.label}</span>
        </section>
      ))}
    </section>
  );
}