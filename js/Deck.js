// Deck.js
// manages the card deck for a single round

export class Deck {
    // all possible cards; reset() copies from this each round
    static TEMPLATE = [
        { card: "A",     platform: "outer" },
        { card: "B",     platform: "outer" },
        { card: "C",     platform: "outer" },
        { card: "D",     platform: "outer" },
        { card: "Joker", platform: "outer" },
        { card: "A",     platform: "inner" },
        { card: "B",     platform: "inner" },
        { card: "C",     platform: "inner" },
        { card: "D",     platform: "inner" },
        { card: "Joker", platform: "inner" },
        { card: "Váltó", platform: "inner" }
    ];

    static PLATFORM_LABEL = { outer: "külső", inner: "középső" }

    constructor() {
        this.cards = [];
        this.outerCount = 0;
        this.innerCount = 0;
        this.reset();
    }

    reset() {
        this.cards = Deck.TEMPLATE.map(c => ({ ...c }));
        this._shuffle();
        this.outerCount = 0;
        this.innerCount = 0;
    }

    /**
     * draws a card; if it's a Váltó (switch), automatically draws a second one too.
     * @returns {{ card: string, platform: string, isSwitchCard: boolean } | null}
     */
    draw() {
        if (this.cards.length === 0) return null;

        const drawn = this.cards.pop();

        if (drawn.card === "Váltó") {
            this._countPlatform(drawn);
            if (this.cards.length === 0) return null;

            const second = this.cards.pop();
            this._countPlatform(second);

            return { card: second.card, platform: second.platform, isSwitchCard: true };
        }

        this._countPlatform(drawn);
        return { card: drawn.card, platform: drawn.platform, isSwitchCard: false };
    }

    // true once 5 cards of either platform type have been drawn
    get isRoundEnding() {
        return this.outerCount >= 5 || this.innerCount >= 5;
    }

    get isEmpty() {
        return this.cards.length === 0;
    }

    _countPlatform(card) {
        if (card.platform === "outer") this.outerCount++;
        else this.innerCount++;
    }

    // fisher-yates shuffle
    _shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }
}
