# UI Framework Design Reference

Implementation reference for `src/ui/` — a lightweight, declarative, zero-dependency UI layer for the game's HTML canvas. This doc is the source of truth while building it; it captures not just the shape of each piece but *why* it's shaped that way, so decisions don't need to be re-derived mid-implementation.

Companion summary: `/home/cam/.claude/plans/i-want-to-plan-drifting-valley.md` (terser version of this document, useful as a quick-scan index).

## 1. Goals & non-goals

**Goals**
- Declarative construction: build a tree of `Column`/`Row`/`Panel`/`Text`/`Button`/`Icon` once, describing structure, not imperative draw calls.
- Flat, clean, minimal visual language: flat fills, rounded corners, soft drop shadows — matching the style already sketched (uncommitted) in `src/windows/window.ts`'s `draw()`.
- Canvas-only, no runtime dependencies — matches the rest of the repo (`package.json` has zero deps beyond Parcel/TypeScript).
- Keyboard focus-navigation **and** mouse hover/click, coexisting, from day one — even though today's game (`src/input.ts`) has no mouse handling at all.
- Slots inside the existing `Menu` / `Game.menuStack` shell (`src/menus/menu.ts`, `src/game.ts`) without changing it.

**Non-goals (v1)**
- Not a general flexbox/CSS-grid reimplementation — just enough layout to express Column/Row with three sizing modes, nothing more general.
- Not reactive/observed state (no signals, no dependency graph) — dynamic values are just re-read every frame (see §9, `Dynamic<T>`).
- Not spatial/2D keyboard navigation — focus order is flat (registration order), matching how `ListWindow`'s index nav already works today. `InventoryWindow`'s bespoke 2D grid nav stays a special case outside this framework for now.
- No rebuild-the-tree-every-frame (React/vdom) model — retained-mode, built once, mutated in place (see §2).

---

## 2. Retained-mode: why, and what it means in practice

The rest of this codebase already works this way — `Window`, `ListWindow`, `Menu` are all constructed once and mutated in place across frames (e.g. `ListWindow.index`, `TextWindow.text`). This framework follows the same shape rather than a React-style "rebuild the tree from state every frame":

- A `Menu` subclass builds its `UITree` **once**, in its constructor.
- Each frame, `Menu.update()` mutates whatever leaf fields need to change (or, better, uses `Dynamic<T>` getters so nothing needs to be mutated by hand — see §9) and then calls `this.ui.update(dt)` / `this.ui.draw(context)`.
- Rebuilding the tree from scratch every frame would need node identity/keying to preserve things like `Button`'s pressed-state or the current focus index across rebuilds — real complexity this project doesn't need at this scale.
- Layout (`measure` + `arrange`) *does* re-run every frame, unconditionally — no dirty-tracking. Cheap at the node counts a menu will actually have (tens, not thousands).

---

## 3. Core node contract

```ts
// src/ui/node.ts
export interface Size { width: number; height: number; }
export interface Constraints { maxWidth: number; maxHeight: number; }
export interface UIContext { theme: Theme; focus: FocusManager; pointer: PointerState; }

export abstract class UINode {
    x = 0; y = 0; width = 0; height = 0;

    abstract measure(constraints: Constraints, ctx: UIContext): Size;
    abstract arrange(rect: Rectangle, ctx: UIContext): void;

    update(ctx: UIContext, dt: number): void {}
    draw(context: CanvasRenderingContext2D, ctx: UIContext): void {}

    get bounds(): Rectangle { return { x: this.x, y: this.y, width: this.width, height: this.height }; }
}
```

Every concrete node (`Column`, `Row`, `Panel`, `Text`, `Button`, `Icon`, `ScrollView`) extends this and implements `measure`/`arrange`; `update`/`draw` are overridden where relevant (leaves usually need `draw`; containers need both to recurse into children).

**Invariants to preserve when implementing any node:**
- `measure()` must be **pure** — never assign to `x/y/width/height`, and must be safe to call more than once with different `Constraints` in the same frame (containers do this: once during their own `measure()`, and again during `arrange()` for `packed` children whose exact slot depends on their natural size).
- `arrange()` is the *only* place `x/y/width/height` get assigned. It receives the final rect — already positioned in absolute logical-pixel screen coordinates by the parent — and must not second-guess it (a node doesn't get to decide it wants to be smaller than what its parent handed it, only how to use that space, e.g. text alignment within it).
- `update()`/`draw()` never do layout math. They only read `this.bounds` (or `this.x/y/width/height` directly). This is what makes mouse hit-testing trivial: `pointInRect(pointer.x, pointer.y, node.bounds)`.
- `UIContext` is passed down through every call, not stored on nodes — it carries the current `Theme`, the tree's `FocusManager`, and the current-frame `PointerState`, all of which can be swapped or refreshed without touching node internals.

---

## 4. `UITree` — the object a `Menu` owns

```ts
// src/ui/tree.ts
export class UITree {
    private focus = new FocusManager();
    private context: UIContext;

    constructor(private root: UINode, theme: Theme = defaultTheme) {
        this.context = { theme, focus: this.focus, pointer: getPointerState() };
        collectFocusables(root, this.focus); // walk the tree once, register every Focusable node
    }

    layout(rect: Rectangle): void {
        const size = this.root.measure({ maxWidth: rect.width, maxHeight: rect.height }, this.context);
        this.root.arrange({ x: rect.x, y: rect.y, width: size.width, height: size.height }, this.context);
    }

    layoutCentered(container: Rectangle): void {
        const size = this.root.measure({ maxWidth: container.width, maxHeight: container.height }, this.context);
        this.layout({
            x: (container.width - size.width) / 2,
            y: (container.height - size.height) / 2,
            width: size.width,
            height: size.height,
        });
    }

    update(dt: number): void {
        this.context.pointer = getPointerState(); // refresh pointer snapshot for this frame
        this.focus.update();                       // keyboard nav + activation
        this.root.update(this.context, dt);
    }

    draw(context: CanvasRenderingContext2D): void {
        this.root.draw(context, this.context);
    }
}
```

**Why one per `Menu`, not a global singleton:** `Game.menuStack: Menu[]` can hold several open menus at once (the "stacked menus" feature — `Game.draw()` draws every menu in the stack, but only calls `update()` on the top one). If `FocusManager`/pointer state were global, a background menu's buttons would still light up on hover, or steal keyboard focus. Scoping both to the `UITree` means an inactive stacked menu simply never has `update()` called on it, so it naturally freezes — no extra guarding code needed anywhere.

**Usage in a `Menu` subclass** (see full worked examples in §14):
```ts
export class SomeMenu extends Menu {
    private ui: UITree;
    constructor(...) {
        super();
        this.ui = new UITree(/* tree built here, once */);
        this.ui.layoutCentered(getScreenSize()); // or this.ui.layout(...)
    }
    update(): void { super.update(); this.ui.update(0); }
    draw(context: CanvasRenderingContext2D): void { this.ui.draw(context); }
}
```
`Menu`/`Game.menuStack` are **not modified** — this is purely what a `Menu` subclass does internally.

---

## 5. How layout actually runs (measure → arrange → update/draw)

Two passes, kicked off by `UITree.layout()`/`layoutCentered()`, then `update()`/`draw()` read the result:

1. **Measure, bottom-up.** Each node is asked "how big do you *want* to be, given at most this much space?" Leaves answer from their own content (`Text` measures its string via `measureTextWidth`, `Button` measures label text + padding). Containers ask their children the same question first, then combine the results per their sizing mode. Purely a query — returns a `Size`, touches no node state.

2. **Arrange, top-down.** The root is given its final rect (from `UITree.layout()`). Every node stores that rect as its `bounds`. Containers additionally decide how to carve their rect into per-child rects (this is where `equal`/`split`/`packed` diverge — see §6) and call `child.arrange(childRect, ctx)` on each, recursing all the way down.

3. **Update/draw** never touch layout — they read `bounds` that arrange already computed.

### Concrete trace

A `Column` with 200px of available height, `gap: 4`, three `Button` children each measuring 20px tall:

| Mode | `measure()` returns | `arrange()` does |
|---|---|---|
| `packed` (default) | sums natural sizes: `20*3 + 4*2 = 68` | walks a `y` cursor, gives each child its natural height: `y=0 h=20`, `y=24 h=20`, `y=48 h=20` |
| `equal` | ignores children, claims all 200px offered | divides `(200 - 4*2)/3 ≈ 64` per cell, hands every child a 64px-tall rect **regardless of the 20px it asked for** |
| `split [0.5, 0.3, 0.2]` | same as `equal` (children's own size ignored) | divides available height *proportionally* instead of evenly: 50%/30%/20% |

In `equal` mode, if a child's content needs more than its 64px cell, it will happily draw past it — so the **container** clips, wrapping each child's `draw()` call in `context.clip()` to that same cell rect it handed the child in `arrange()`. This is per-cell, not one clip around the whole container, so each child clips independently.

`Row` is the identical story on the horizontal axis. Implement it as a **literal mirror** of `Column` (separate ~90-line file, not a shared abstract `Flex` base parameterized by axis) — an axis-swap abstraction (`mainExtent()`/`crossExtent()` helpers) saves maybe 40 lines but makes the arrange-time math meaningfully harder to verify by eye, which matters more at this project's scale than the duplication cost.

---

## 6. Column & Row

```ts
// src/ui/layout.ts
export type MainAxisSizing =
    | { mode: "equal" }
    | { mode: "packed" }                          // default
    | { mode: "split"; proportions: number[] };    // e.g. [0.3, 0.7]; normalized (need not sum to 1)

export type CrossAlign = "start" | "center" | "end" | "stretch"; // default: stretch
export interface Insets { top: number; right: number; bottom: number; left: number; }
export interface FlexOptions {
    sizing?: MainAxisSizing;
    gap?: number;                  // px between children, default 0
    padding?: number | Insets;     // default 0
    align?: CrossAlign;            // cross-axis alignment for packed mode
}

export function resolveInsets(v: number | Insets): Insets { return typeof v === "number" ? { top: v, right: v, bottom: v, left: v } : v; }
export function insetRect(rect: Rectangle, insets: Insets): Rectangle { /* shrink rect by insets */ }
export function pointInRect(x: number, y: number, r: Rectangle): boolean {
    return x >= r.x && x < r.x + r.width && y >= r.y && y < r.y + r.height;
}
```

```ts
// src/ui/column.ts
export class Column extends UINode {
    constructor(private children: UINode[], private opts: FlexOptions = {}) { super(); }
    // measure(): packed sums child heights + gaps (see §5 table); equal/split just claim all offered space.
    // arrange(): dispatches per `opts.sizing.mode` exactly as described in §5; equal mode additionally
    //            records each child's cell rect for use as a clip region in draw().
    // draw(): equal mode wraps each child.draw() in ctx.save()/ctx.clip(cellRect)/ctx.restore();
    //         other modes just draw children in order, no clipping.
    // update(): forwards to every child's update().
}
```
`Row` — same file structure, `x`↔`y` and `width`↔`height` swapped throughout, `align` operates on the vertical axis instead of horizontal.

**Cross-axis alignment (`align`, packed mode only)**: within the cross axis (width, for a `Column`), a packed child can be `"stretch"` (fill the container's width — the default), or sized to its own natural width and positioned `"start"`/`"center"`/`"end"`. `equal` and `split` modes always stretch children across the cross axis (a cell is a full-width/height slice by definition).

---

## 7. Panel

Generalizes `Window.draw()`'s current body — `context.roundRect(...)` + `shadowColor`/`shadowOffsetY`/`shadowBlur` + flat fill — into a reusable, theme-driven, single-child wrapper that also auto-sizes around its content (something no `Window` subclass does generically today; `InventoryWindow` hand-computes its own size in its constructor).

```ts
// src/ui/panel.ts
export interface PanelStyle { fill: string; radius: number; shadow: ShadowStyle | null; padding: number | Insets; }

export class Panel extends UINode {
    constructor(private child?: UINode, private style: Partial<PanelStyle> = {}) { super(); }
    // resolvedStyle(ctx) = { ...ctx.theme.panel, ...this.style }  — instance style overrides theme defaults field-by-field
    // measure(): child measured with constraints shrunk by padding; own size = child size + padding.
    // arrange(): own bounds = rect; child gets rect shrunk by padding.
    // draw(): ctx.save(); apply shadow (if style.shadow); roundRect + fill; ctx.restore(); then child.draw().
    //         Shadow must be reset (ctx.restore()) BEFORE drawing the child, or the child inherits the panel's shadow.
}
```
`Window`/`ListWindow`/`TextWindow`/`InventoryWindow` are effectively replaced by `Panel` wrapping whichever content node is appropriate — a `Column` of `Button`s instead of `ListWindow`, a `Text` instead of `TextWindow`.

---

## 8. Text — typography helper

Font *tokens* instead of ad hoc `context.font = "10px sans"` strings scattered through the old code; measurement/wrapping built into `measure()` instead of manually pre-formatted `\n`-joined strings (see `recipeShopMenu.ts`'s current `reduce`-built text).

```ts
// src/ui/text.ts
export interface FontSpec { family: string; size: number; weight?: string; lineHeight: number; }
export type FontToken = "heading" | "body" | "small";

export function cssFont(spec: FontSpec): string { return `${spec.weight ? spec.weight + " " : ""}${spec.size}px ${spec.family}`; }

// measureText needs *a* 2d context, not necessarily the one currently drawing — set once at startup.
let measureCtx: CanvasRenderingContext2D | null = null;
export function setMeasureContext(ctx: CanvasRenderingContext2D): void { measureCtx = ctx; }
export function measureTextWidth(text: string, font: FontSpec): number {
    measureCtx!.font = cssFont(font);
    return measureCtx!.measureText(text).width;
}

export function wrapText(text: string, font: FontSpec, maxWidth: number): string[] {
    // greedy word-wrap: accumulate words into a line until adding the next one would exceed maxWidth,
    // then start a new line. Standard algorithm, no hyphenation/justification.
}

export class Text extends UINode {
    constructor(
        private textSource: Dynamic<string>,   // see §9 — plain string OR () => string
        private opts: { font?: FontToken; color?: string; align?: "left" | "center" | "right"; wrap?: boolean } = {}
    ) { super(); }
    // measure(): resolve textSource -> split on "\n" -> if opts.wrap, wrapText() each line against constraints.maxWidth.
    //            Cache the resolved lines on the instance (measure and draw need the same lines; re-measuring in
    //            draw() would be wasteful and could disagree if textSource is dynamic and changed mid-frame — resolve once per layout pass).
    //            width = min(maxWidth, widest line); height = lines.length * font.lineHeight.
    // arrange(): just stores bounds — text has no children.
    // draw(): context.font = cssFont(spec); context.textAlign = opts.align; fillText each line at
    //         y = this.y + i * lineHeight. Relies on the global context.textBaseline = "top" set once
    //         in Game.draw() — every text-drawing node in this framework assumes "top" baseline; if that
    //         global setting ever moves/changes, every Text/Button label needs revisiting.
}
```

---

## 9. `Dynamic<T>` — how declarative construction stays declarative with live state

The naive approach — build the tree once, then reach back into it from `Menu.update()` to mutate fields every frame (`this.buyButton.disabled = this.player.gold < 500`) — works but doesn't scale: every dynamic field needs a matching hand-written assignment line in every `Menu.update()`, which is exactly the boilerplate this framework exists to remove.

Instead, any prop that can change over time accepts **either a plain value or a zero-arg getter**, and the tree stays a single declarative expression at construction time:

```ts
export type Dynamic<T> = T | (() => T);
export function resolveDynamic<T>(v: Dynamic<T>): T { return typeof v === "function" ? (v as () => T)() : v; }
```

```ts
new Button("Buy Sword (500g)", {
    disabled: () => this.player.gold < 500,   // re-evaluated every frame, not read once at construction
    onActivate: () => this.buy(),
});

new Text(() => `Name: ${this.selected.name}\nStatus: ${adventurerStateToDescription(this.selected.adventurerState)}`, { wrap: true });
```

`Button.update()` and `Text.measure()` both call `resolveDynamic()` on their respective dynamic prop every frame — the *reading* of live state happens inside the node itself, not wired up by hand outside it. This is **not** reactivity — there's no dependency tracking, no subscriptions, nothing watches `player.gold`. It's still just "read fresh every frame," identical in spirit to `craftingMenu.ts`'s existing `updateChoices()` pattern — just moved from an external per-menu method into the framework's own per-node `update()`/`measure()` calls, so it doesn't need to be written per-menu at all.

Both `Button`'s `disabled` and `Text`'s constructor text argument should be typed `Dynamic<T>` for this reason. Other props (font, color, alignment) are expected to be static enough per-instance that they don't need this — add `Dynamic<T>` to more props only if a real use case shows up.

---

## 10. Button — keyboard focus + mouse, coexisting

**State model**: `idle | hover | focused | pressed | disabled`, drawn distinctly so both input modes stay visible simultaneously (hover = fill tint, focus = outline ring — a mouse user always sees where keyboard focus would land, and vice versa).

```ts
// src/ui/focus.ts
export interface Focusable { focusable: true; disabled: boolean; bounds: Rectangle; activate(): void; }

export class FocusManager {
    private items: Focusable[] = [];
    index = 0;

    register(item: Focusable): void { this.items.push(item); }
    current(): Focusable | undefined { return this.items[this.index]; }
    isFocused(item: Focusable): boolean { return this.items[this.index] === item; }
    focus(item: Focusable): void { const i = this.items.indexOf(item); if (i >= 0) this.index = i; }

    update(): void {
        if (!this.items.length) return;
        // Flat registration-order nav (not spatial/2D) — S/D = next, W/A = previous, works for
        // both vertical Columns and horizontal Rows without any per-container directional logic.
        // Mirrors ListWindow's existing index bookkeeping.
        if (isKeyPressed(KeyCode.S) || isKeyPressed(KeyCode.D)) this.step(1);
        else if (isKeyPressed(KeyCode.W) || isKeyPressed(KeyCode.A)) this.step(-1);
        if (isKeyPressed(KeyCode.E)) {
            const c = this.current();
            if (c && !c.disabled) c.activate(); // disabled items stay focusable but inert — matches ListWindow's `enabled` check, NOT skipped in nav order
        }
    }
    private step(dir: 1 | -1): void { const n = this.items.length; this.index = (this.index + dir + n) % n; }
}
```

**Pointer (mouse) state** — additions to `src/input.ts`, same module-level-function style already used there for keyboard:

```ts
// additions to src/input.ts
export interface PointerState { x: number; y: number; down: boolean; pressed: boolean; released: boolean; }
let pointerX = 0, pointerY = 0, pointerDown = false, pointerPressed = false, pointerReleased = false;

export function handleMouseMove(e: MouseEvent, canvas: HTMLCanvasElement): void {
    const rect = canvas.getBoundingClientRect();
    const scale = getScale(); // src/screen.ts — same 2x scale everything else already accounts for
    pointerX = (e.clientX - rect.left) / scale;
    pointerY = (e.clientY - rect.top) / scale;
}
export function handleMouseDown(): void { pointerDown = true; pointerPressed = true; }
export function handleMouseUp(): void { pointerDown = false; pointerReleased = true; }
export function getPointerState(): PointerState { return { x: pointerX, y: pointerY, down: pointerDown, pressed: pointerPressed, released: pointerReleased }; }
export function clearPointerEdge(): void { pointerPressed = false; pointerReleased = false; } // call once/frame, alongside clearPressedKeys()
```

Wired in `src/index.ts`, next to the existing `document.onkeydown = handleKeyDown`:
```ts
canvas.onmousemove = (e) => handleMouseMove(e, canvas);
canvas.onmousedown = () => handleMouseDown();
canvas.onmouseup = () => handleMouseUp();
```
And `clearPointerEdge()` called next to the existing `clearPressedKeys()` in `index.ts`'s per-frame `update()` — `pressed`/`released` are edge-triggered exactly like `isKeyPressed`, `down` is level-triggered exactly like `isKeyDown`.

**`Button`**, tying it together:

```ts
// src/ui/button.ts
export class Button extends UINode implements Focusable {
    readonly focusable = true as const;
    private pointerDownInside = false;

    constructor(private label: string, private opts: { disabled?: Dynamic<boolean>; onActivate?: () => void; font?: FontToken } = {}) { super(); }

    get disabled(): boolean { return resolveDynamic(this.opts.disabled ?? false); }
    activate(): void { if (!this.disabled) this.opts.onActivate?.(); }

    // measure(): label text width (via measureTextWidth) + theme.spacing padding, similarly for height.
    // arrange(): just stores bounds.

    update(ctx: UIContext): void {
        if (this.disabled) return;
        const p = ctx.pointer;
        const hovering = pointInRect(p.x, p.y, this.bounds);
        // A CLICK moves keyboard focus here; hovering alone does not — prevents the focus ring from
        // jumping around on every mouse twitch, which would feel wrong in a keyboard-first game.
        if (hovering && p.pressed) { this.pointerDownInside = true; ctx.focus.focus(this); }
        if (p.released) {
            if (hovering && this.pointerDownInside) this.activate();
            this.pointerDownInside = false;
        }
    }

    draw(context: CanvasRenderingContext2D, ctx: UIContext): void {
        const p = ctx.pointer;
        const hovering = pointInRect(p.x, p.y, this.bounds);
        const state = this.disabled ? "disabled"
            : (hovering && p.down && this.pointerDownInside) ? "pressed"
            : ctx.focus.isFocused(this) ? "focused"
            : hovering ? "hover" : "idle";
        const palette = ctx.theme.button[state];
        // draw roundRect fill from palette.fill; if state === "focused", additionally stroke an outline ring;
        // draw label text centered, color = palette.text.
    }
}
```

**Coexistence summary** (the core answer to "how do keyboard and mouse share one Button"):
- **Focus** = keyboard concept: one index into a flat list, stepped by W/S/A/D, activated by E.
- **Hover** = mouse concept: pure geometry against the already-arranged `bounds`, recomputed every draw — no stored state beyond the current pointer position.
- **Click** = mouse down+up on the same bounds → `activate()`, *and* moves focus there as a side effect, keeping the two models in sync after any mouse interaction.
- Because `Game.menuStack` only calls `update()` on the top menu, and each menu's `UITree` only refreshes its own pointer snapshot inside its own `update()`, background/inactive stacked menus automatically never show hover or react to clicks.

---

## 11. Icon

```ts
// src/ui/icon.ts
export type IconSource =
    | { kind: "sprite"; image: string; sx: number; sy: number; sw: number; sh: number } // sub-rect of getImageResource(image)
    | { kind: "shape"; shape: "circle" | "roundedSquare"; color: string };               // fallback until real art exists

export class Icon extends UINode {
    constructor(private source: IconSource, private size: number = 16) { super(); }
    measure(): Size { return { width: this.size, height: this.size }; }
    arrange(rect: Rectangle): void { /* center this.size x this.size within rect */ }
    draw(context: CanvasRenderingContext2D): void {
        // sprite: context.drawImage(getImageResource(source.image), sx, sy, sw, sh, this.x, this.y, size, size)
        // shape:  fillStyle = source.color; draw a circle (arc) or roundedSquare (roundRect) at this.size
    }
}
```
`ui.png` (already loaded as `getImageResource("ui")`, 416×224px) is a natural first sprite source once its regions are repurposed from the old 9-slice layout, or a dedicated icon atlas is added to `resources.ts`'s `imagesToLoad` map. The `shape` fallback exists specifically because slots like `InventoryWindow`'s item grid currently render as bare flat-colored rects with no icons at all — `Icon` with a shape fallback is a drop-in improvement even before real art exists.

---

## 12. ScrollView

`ListWindow` today supports scrolling through more choices than fit on screen (`startIndex` bookkeeping, keeps the selected item visible). Column's `equal` mode only *clips* overflow (doesn't reveal it), and `packed` mode just grows past bounds unclipped — neither scrolls. Long lists (a big inventory, many recipes) need this, so it's in scope for v1, not deferred:

```ts
// src/ui/scrollView.ts
export class ScrollView extends UINode {
    private scrollY = 0;
    constructor(private child: UINode, private opts: { maxHeight?: number } = {}) { super(); }

    // measure(): measure child with an effectively unbounded maxHeight (its natural full content height),
    //            report own size = { width: child.width, height: min(child.height, opts.maxHeight ?? constraints.maxHeight) }.
    // arrange(): own bounds = rect (the possibly-shorter visible window); child is arranged at its FULL
    //            natural height starting at (rect.x, rect.y - scrollY) — child.bounds can legitimately
    //            extend above/below the visible rect; that's fine, draw() clips it.
    // update(): if a focused descendant's bounds fall outside this.bounds, adjust scrollY to bring it
    //           back into view (clamped to [0, child.height - height]) — this is what makes keyboard
    //           nav "just work" through a long scrolled list, without ScrollView needing to know
    //           anything about which descendant is focused, only where its bounds currently are.
    //           Mouse wheel (if added later) would adjust scrollY directly the same way.
    // draw(): context.save(); clip to this.bounds; context.translate(0, -scrollY); child.draw(...); context.restore().
}
```
Usage: wrap any `packed`-mode `Column` of `Button`s in a `ScrollView` with a fixed `maxHeight` to reproduce `ListWindow`'s "keep the selection on screen" behavior generically, for any content — not just a flat choice list.

---

## 13. Theme

A single token module everything else reads from by default, overridable per-instance (`Panel`'s `style` param, etc.):

```ts
// src/ui/theme.ts
export interface ShadowStyle { color: string; offsetX: number; offsetY: number; blur: number; }
export interface Theme {
    colors: { background: string; surface: string; primary: string; text: string; textMuted: string; disabled: string; focusRing: string };
    radius: number;
    spacing: { xs: number; sm: number; md: number; lg: number; xl: number };
    fonts: Record<FontToken, FontSpec>;
    panel: PanelStyle;
    button: Record<"idle" | "hover" | "focused" | "pressed" | "disabled", { fill: string; text: string }>;
}

export const defaultTheme: Theme = {
    colors: { background: "#e5e5e5", surface: "lightgray", primary: "#3b6ea5", text: "black", textMuted: "#555", disabled: "#999", focusRing: "#3b6ea5" },
    radius: 16,
    spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 },
    fonts: {
        heading: { family: "sans-serif", size: 14, weight: "bold", lineHeight: 18 },
        body: { family: "sans-serif", size: 10, lineHeight: 14 },
        small: { family: "sans-serif", size: 8, lineHeight: 11 },
    },
    panel: { fill: "lightgray", radius: 16, shadow: { color: "black", offsetX: 0, offsetY: 8, blur: 32 }, padding: 16 },
    button: {
        idle: { fill: "white", text: "black" }, hover: { fill: "#f0f0f0", text: "black" },
        focused: { fill: "white", text: "black" }, pressed: { fill: "#d8d8d8", text: "black" },
        disabled: { fill: "#eee", text: "#999" },
    },
};
```
Every default value above (`radius: 16`, `shadowOffsetY: 8`, `shadowBlur: 32`, `"lightgray"`) is lifted verbatim from the current `Window.draw()`, so migrating an existing menu onto `Panel` reproduces today's exact look with zero visual change until it's deliberately restyled.

---

## 14. File structure

```
src/ui/
    node.ts       UINode, Size, Constraints, UIContext
    theme.ts      Theme, defaultTheme
    layout.ts     Insets helpers, pointInRect, MainAxisSizing/CrossAlign/FlexOptions, Dynamic<T>
    column.ts     Column
    row.ts        Row
    panel.ts      Panel, PanelStyle
    text.ts       Text, wrapText/measureTextWidth/cssFont, setMeasureContext
    button.ts     Button
    icon.ts       Icon, IconSource
    scrollView.ts ScrollView
    focus.ts      FocusManager, Focusable
    tree.ts       UITree
```
No barrel/index file — matches the rest of the repo (every consumer imports directly, e.g. `import { Button } from "../ui/button"`). Small types live alongside their owning file rather than a central dump, also matching existing convention.

**Integration points — nothing outside `src/ui/` is redesigned:**
- `screen.ts` — unchanged; `getScreenSize()` is the root rect passed into `UITree.layout()`/`layoutCentered()`.
- `resources.ts` — unchanged; `Icon` calls `getImageResource()` directly, same as any other sprite-drawing code today.
- `input.ts` — **extended**, not replaced (§10's pointer additions); existing `isKeyPressed`/`KeyCode` reused as-is by `FocusManager`.
- `index.ts` — gains mouse listeners + `setMeasureContext(context)` call (§8, §10), alongside its existing `document.onkeydown` wiring and `clearPressedKeys()` call.
- `menu.ts` / `game.ts` — **untouched**. `Menu` keeps `update()`/`close()`/`draw()`; `Game.menuStack` keeps working exactly as today.

---

## 15. Worked example: `ConfirmMenu`

**Before** (current `src/menus/confirmMenu.ts` — a `ListWindow` repurposed as a Yes/No choice, no room for a message):
```ts
export class ConfirmMenu extends Menu {
    choiceWindow: ListWindow;
    onConfirm?: () => void;
    onReject?: () => void;
    constructor() {
        super();
        this.choiceWindow = new ListWindow(0, 150, 20, 7, [{ text: "Yes", enabled: true }, { text: "No", enabled: true }]);
        this.choiceWindow.onSelect = (index) => (index === 0 ? this.onConfirm?.() : this.onReject?.());
        this.choiceWindow.centerHorizontallyIn(getScreenSize());
    }
    update() { super.update(); this.choiceWindow.update(); }
    draw(context: CanvasRenderingContext2D) { this.choiceWindow.draw(context); }
}
```

**After:**
```ts
export class ConfirmMenu extends Menu {
    private ui: UITree;
    onConfirm?: () => void;
    onReject?: () => void;

    constructor(message: string) {
        super();
        this.ui = new UITree(
            new Panel(
                new Column(
                    [
                        new Text(message, { align: "center" }),
                        new Row(
                            [
                                new Button("Yes", { onActivate: () => this.onConfirm?.() }),
                                new Button("No", { onActivate: () => this.onReject?.() }),
                            ],
                            { sizing: { mode: "split", proportions: [0.5, 0.5] }, gap: 8 }
                        ),
                    ],
                    { gap: 12 }
                )
            )
        );
        this.ui.layoutCentered(getScreenSize());
    }

    update(): void { super.update(); this.ui.update(0); }
    draw(context: CanvasRenderingContext2D): void { this.ui.draw(context); }
}
```
Adds a message string the old version had no room for, in roughly the same line count — hand-written positioning (`centerHorizontallyIn`, manual coordinates) disappears in favor of declared structure.

## 16. Worked example: `AdventurerMenu`

**Before**: three separately-positioned `Window`s; `statusWindow.x` computed by hand as `adventurerList.x + adventurerList.pixelWidth + 8`; status text rebuilt as a manually `\n`-joined string in `update()`.

**After** — outer `Row` with a 30/70 `split`: left = `packed` list of `Button`s (natural height, no forced equal division), right = a `Panel` wrapping wrapped `Text` that live-tracks the selection via `Dynamic<T>`:
```ts
export class AdventurerMenu extends Menu {
    private ui: UITree;
    private selected: Adventurer;

    constructor(private adventurers: Adventurer[]) {
        super();
        this.selected = adventurers[0];

        const listButtons = adventurers.map((a) =>
            new Button(a.name, { onActivate: () => { this.selected = a; } })
        );

        this.ui = new UITree(
            new Column(
                [
                    new Text("Adventurers", { font: "heading", align: "center" }),
                    new Row(
                        [
                            new Panel(new Column(listButtons, { gap: 4 })), // packed (default)
                            new Panel(
                                new Text(
                                    () => `Name: ${this.selected.name}\nStatus: ${adventurerStateToDescription(this.selected.adventurerState)}\nFood Buff: ${this.selected.foodBuff}`,
                                    { wrap: true }
                                )
                            ),
                        ],
                        { sizing: { mode: "split", proportions: [0.3, 0.7] }, gap: 8 }
                    ),
                ],
                { gap: 8 }
            )
        );
        this.ui.layout(getScreenSize());
    }

    update(): void { super.update(); this.ui.update(0); }
    draw(context: CanvasRenderingContext2D): void { this.ui.draw(context); }
}
```
No `Menu.update()` text-rebuilding needed at all — the `Text` node's `Dynamic<T>` getter reads `this.selected` fresh every frame. If the adventurer list is long enough to need scrolling, wrap `listButtons`' `Column` in a `ScrollView` (§12) with a `maxHeight`.

---

## 17. Decisions log (settled, with reasoning)

| Decision | Reasoning |
|---|---|
| Retained-mode tree, not rebuilt per frame | Matches existing `Window`/`Menu` pattern; avoids needing node identity/keying for state like press/focus across rebuilds |
| Layout re-runs unconditionally every frame | Cheap at this node count; avoids dirty-tracking complexity entirely |
| Hover never steals keyboard focus — only a click does | Prevents the focus ring jumping on every mouse twitch, which would feel wrong in a keyboard-first game |
| Focus nav is flat/registration-order, not spatial/2D | Mirrors `ListWindow`'s existing index model; simplest thing that works for Columns/Rows; `InventoryWindow`'s 2D grid nav stays a special case, not subsumed |
| Disabled buttons stay focusable-but-inert (not skipped in nav order) | Matches `ListWindow`'s current behavior (`enabled: false` choices are still navigable, just inert on activate) |
| `Dynamic<T>` getters instead of `Menu.update()` reaching into the tree | Keeps construction fully declarative; avoids a hand-written mutation line per dynamic field per menu |
| Raw logical pixels, not `Window`'s `width * 8` cell-grid units | Cleaner without a 9-slice sprite to align to; means migrating a menu means re-deriving sizes, not copy-pasting old cell counts |
| `Row`/`Column` written as literal mirrors, not a shared `Flex` base | Avoids axis-abstraction indirection that would make arrange-time math harder to verify by eye |
| `ScrollView` included in v1 (not deferred) | Long lists (inventory, recipes) are a real, current use case — `Column`'s `equal`/`packed` modes don't cover them |
| `FocusManager`/pointer state scoped per-`UITree`, not global | `Game.menuStack` can hold multiple open menus; only the top one should react to hover/click/focus |

---

## 18. Migration checklist (per existing menu)

1. Identify the `Window`/`ListWindow`/`TextWindow` instances the `Menu` currently builds and how they're positioned relative to each other.
2. Rebuild that structure as a `Column`/`Row`/`Panel` tree — pick sizing mode per the original intent (a fixed list → `packed` inside a `ScrollView` if long; side-by-side panels with a specific proportion → `split`; evenly-divided slots → `equal`).
3. Replace any `Menu.update()` logic that rewrites text/enabled-state (`updateChoices()`-style methods) with `Dynamic<T>` getters on the relevant `Text`/`Button` nodes where possible.
4. Build the `UITree` once in the constructor, call `layout()`/`layoutCentered()`.
5. Reduce `Menu.update()`/`draw()` to `super.update(); this.ui.update(0);` / `this.ui.draw(context);`.
6. Verify keyboard nav (W/S/A/D + E) still reaches every interactive element in a sensible order, and mouse hover/click works identically.
