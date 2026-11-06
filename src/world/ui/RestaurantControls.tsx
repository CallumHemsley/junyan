import type { ReactNode } from "react";
import type { Food, Order, Phase } from "../../contracts";
import WordToken from "../../WordToken";
import FoodArt from "../../FoodArt";
import type { DialogueProps } from "./ContextualInteraction";

export type RestaurantTableControlsProps = Pick<DialogueProps, "onLookup"> & {
  phase: Phase;
  order: Order;
  foods: readonly Food[];
  change: number;
  onChange: (change: number) => void;
  summary: ReactNode;
  changeLabel: ReactNode;
  resetControl: ReactNode;
  receiptSummary: ReactNode;
  thanks: ReactNode;
};

export function RestaurantTableControls({ phase, order, foods, change, onChange, onLookup, summary, changeLabel, resetControl, receiptSummary, thanks }: RestaurantTableControlsProps) {
  if (phase === "checkout") return <div className="world-table-change">
    <div>{summary}</div>
    <div className="world-change-output" aria-live="polite">{changeLabel}</div>
    <div className="world-context-options">
      {[1, 2, 5, 10].map(value => <button key={value} onClick={() => onChange(change + value)}>+{value}块</button>)}
      {resetControl}
    </div>
  </div>;
  if (phase !== "served") return null;
  return <div className="world-table-receipt">
    {order.items.map(item => {
      const food = foods.find(food => food.id === item.foodId)!;
      return <p key={item.foodId}><WordToken word={food.word} look="plain" onLookup={onLookup} /><span>×{item.quantity}</span><span>{food.price * item.quantity}块</span></p>;
    })}
    <div>{receiptSummary}</div>
    {thanks}
  </div>;
}

export type KitchenControlsProps = Pick<DialogueProps, "onLookup"> & {
  foods: readonly Food[];
  tray: readonly string[];
  pickupEnabled: boolean;
  trayHeading: ReactNode;
  onPickup: (foodId: string) => void;
  onReturn: (index: number) => void;
};

export function KitchenControls({ foods, tray, pickupEnabled, trayHeading, onPickup, onReturn, onLookup }: KitchenControlsProps) {
  return <>
    <div className="world-kitchen-foods">
      {foods.map(food => <div className="world-kitchen-food" key={food.id}>
        <button aria-label={`拿${food.word.hanzi}`} disabled={!pickupEnabled} onClick={() => onPickup(food.id)}>
          <FoodArt kind={food.kind} /><small>{food.price}块</small>
        </button>
        <WordToken word={food.word} look="plain" onLookup={onLookup} />
      </div>)}
    </div>
    <div className="world-kitchen-tray" role="group" aria-label="托盘">
      <div className="world-kitchen-tray-heading">{trayHeading}</div>
      <div className="world-context-options">{tray.map((id, index) => {
        const food = foods.find(food => food.id === id)!;
        return <div className="world-tray-item" key={`${id}-${index}`}>
          <WordToken word={food.word} look="plain" onLookup={onLookup} />
          <button aria-label={`放回${food.word.hanzi}`} onClick={() => onReturn(index)}>×</button>
        </div>;
      })}</div>
    </div>
  </>;
}
