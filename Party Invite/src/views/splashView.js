import { eventContent } from "../data/content.js";
import { assetCatalog } from "../data/assetCatalog.js";
import { getInviteGuests } from "../data/guests.js";

function renderCelebrationPieces(scope, { balloons = [], confetti = [], sparks = [] }) {
  return `
    <div class="celebration-layer celebration-layer-${scope}" aria-hidden="true">
      ${balloons.map((name) => `<span class="celebration-balloon ${scope}-balloon-${name}"></span>`).join("")}
      ${confetti.map((name) => `<span class="celebration-confetti ${scope}-confetti-${name}"></span>`).join("")}
      ${sparks.map((name) => `<span class="celebration-spark ${scope}-spark-${name}"></span>`).join("")}
    </div>
  `;
}

function renderAtmosphere() {
  return `
    <div class="landing-atmosphere" aria-hidden="true">
      <img class="landing-parchment-texture" src="${assetCatalog.textures.parchmentFolded}" alt="" />
      <img class="landing-frame-overlay" src="${assetCatalog.borders.fantasyFrameLandscapeGold}" alt="" />
      <img class="landing-hero-character" src="${assetCatalog.characters.amberElfRogue}" alt="" />
      ${renderCelebrationPieces("landing", {
        balloons: ["a", "b", "c", "d", "e", "f", "g"],
        confetti: ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l"],
        sparks: ["a", "b", "c", "d"]
      })}
    </div>
  `;
}

function renderInviteAtmosphere() {
  return `
    <div class="invite-atmosphere" aria-hidden="true">
      <img class="invite-guardian-character" src="${assetCatalog.characters.gladranWingedGuardianWide}" alt="" />
      <img class="invite-loot-accent" src="${assetCatalog.loot.treasurePileRuby}" alt="" />
      <img class="invite-purse-accent" src="${assetCatalog.loot.coinPurseRed}" alt="" />
      ${renderCelebrationPieces("invite", {
        balloons: ["a", "b", "c", "d"],
        confetti: ["a", "b", "c", "d", "e", "f", "g", "h"],
        sparks: ["a", "b"]
      })}
    </div>
  `;
}

function renderScrollBody({ stage, selectedGuest }) {
  const scrollPaperStyle = `style="--scroll-paper-texture: url('${assetCatalog.textures.parchmentFolded}')"`;

  if (stage === "scroll-reveal") {
    return `
      <div class="scroll-paper scroll-paper-loading" ${scrollPaperStyle}>
        <p class="scroll-kicker">Processing Record</p>
        <h2>${selectedGuest?.displayName ?? "Adventurer"}</h2>
        <p class="scroll-copy">${eventContent.satireTagline}</p>
      </div>
    `;
  }

  return `
    <div class="scroll-paper scroll-paper-ready" ${scrollPaperStyle}>
      <p class="scroll-kicker">${eventContent.scrollHeadline}</p>
      <h2>${selectedGuest?.displayName ?? "Adventurer"}</h2>
      <p class="scroll-copy">${eventContent.personalizedLead}</p>
      <div class="invite-highlights">
        <span>${eventContent.dateLabel}</span>
        <span>Hosted by ${eventContent.hostName}</span>
        <span>Daggerheart at ${eventContent.campaignStart}</span>
      </div>
      <p class="scroll-tagline">${eventContent.satireTagline}</p>
    </div>
  `;
}

function renderNameSelectScreen(state) {
  const guestOptions = getInviteGuests()
    .map(
      (guest) => `
        <option value="${guest.id}" ${guest.id === state.selectedGuestId ? "selected" : ""}>
          ${guest.displayName}${guest.aliases.length ? ` (${guest.aliases.join(", ")})` : ""}
        </option>
      `
    )
    .join("");

  return `
    <main class="intro-shell intro-stage-landing" id="main-content">
      <section class="intro-scene-panel">
        <div class="scene-copy">
          <p class="eyebrow">${eventContent.sceneKicker}</p>
          <h1>${eventContent.title}</h1>
          <p class="scene-headline">${eventContent.sceneHeadline}</p>
          <p class="scene-copy-text">${eventContent.sceneCopy}</p>
          <p class="scene-support">${eventContent.sceneSecondary}</p>

          <form class="landing-form" data-form="issue-scroll">
            <label class="field">
              <span>${eventContent.namePrompt}</span>
              <select name="guestId" required>
                <option value="">Select your name</option>
                ${guestOptions}
              </select>
            </label>
            <p class="field-hint">${eventContent.inviteSelectHint}</p>
            <button class="button button-primary" type="submit">
              ${eventContent.primaryCTA}
            </button>
          </form>
        </div>
        ${renderAtmosphere()}
      </section>
    </main>
  `;
}

function renderInviteScreen(state, selectedGuest) {
  const isRevealStage = ["scroll-reveal", "personalized-card", "dashboard-transition"].includes(state.introStage);
  const isReadyStage = ["personalized-card", "dashboard-transition"].includes(state.introStage);
  const showReadyActions = state.introStage === "personalized-card";

  return `
    <main class="intro-shell intro-stage-${state.introStage}" id="main-content">
      <section class="intro-invite-panel">
        ${renderInviteAtmosphere()}
        <p class="scroll-adventurer" aria-label="Selected adventurer">
          <span class="scroll-adventurer-label">Adventurer</span>
          <strong>${selectedGuest?.displayName ?? "Adventurer"}</strong>
        </p>

        <div class="scroll-stage ${isRevealStage ? "scroll-stage-active" : ""} ${isReadyStage ? "scroll-stage-ready" : ""}">
          <div class="scroll-shadow"></div>
          <div class="scroll-shell ${isRevealStage ? "scroll-shell-open" : ""}">
            <span class="scroll-roller scroll-roller-left"></span>
            <span class="scroll-roller scroll-roller-right"></span>
            ${renderScrollBody({ stage: state.introStage, selectedGuest })}
          </div>
        </div>

        ${
          showReadyActions
            ? `
              <div class="scroll-actions">
                <button class="button button-secondary" type="button" data-action="change-name">
                  ${eventContent.changeGuestLabel}
                </button>
                <button class="button button-primary" type="button" data-action="accept-invitation">
                  ${eventContent.acceptInviteLabel}
                </button>
              </div>
            `
            : ""
        }
      </section>
    </main>
  `;
}

export function renderSplashView({ state, selectedGuest }) {
  if (state.introStage === "landing") {
    return renderNameSelectScreen(state);
  }
  return renderInviteScreen(state, selectedGuest);
}
