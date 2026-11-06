import type { Food, Order, Phase } from "../../contracts";
import WordToken from "../../WordToken";
import FoodArt from "../../FoodArt";
import type { DialogueProps } from "./ContextualInteraction";

export type RestaurantTableControlsProps = Pick<DialogueProps, "onLookup"> & {
  phase: Phase;
  order: Order;
  foods: readonly Food[];
  total: number;
  change: number;
  onChange: (change: number) => void;
};

export function RestaurantTableControls({ phase, order, foods, total, change, onChange, onLookup }: RestaurantTableControlsProps) {
  if (phase === "checkout") return <div className="world-table-change">
    <p>共 {total}块 · 收到 {order.paid}块</p>
    <output aria-live="polite">找零 {change}块</output>
    <div className="world-context-options">
      {[1, 2, 5, 10].map(value => <button key={value} onClick={() => onChange(change + value)}>+{value}块</button>)}
      <button onClick={() => onChange(0)}>重来</button>
    </div>
  </div>;
  if (phase !== "served") return null;
  return <div className="world-table-receipt">
    {order.items.map(item => {
      const food = foods.find(food => food.id === item.foodId)!;
      return <p key={item.foodId}><WordToken word={food.word} look="plain" onLookup={onLookup} /><span>×{item.quantity}</span><span>{food.price * item.quantity}块</span></p>;
    })}
    <p>共 {total}块 · 找零 {order.paid - total}块</p>
    <span className="thanks-chop">多谢</span>
  </div>;
}

export type KitchenControlsProps = Pick<DialogueProps, "onLookup"> & {
  foods: readonly Food[];
  tray: readonly string[];
  pickupEnabled: boolean;
  onPickup: (foodId: string) => void;
  onReturn: (index: number) => void;
};

export function KitchenControls({ foods, tray, pickupEnabled, onPickup, onReturn, onLookup }: KitchenControlsProps) {
  return <>
    <div className="world-kitchen-foods">
      {foods.map(food => <div className="world-kitchen-food" key={food.id}>
        <button aria-label={`拿${food.word.hanzi}`} disabled={!pickupEnabled} onClick={() => onPickup(food.id)}>
          <FoodArt kind={food.kind} /><span>{food.word.hanzi}</span><small>{food.price}块</small>
        </button>
        <WordToken word={food.word} look="plain" onLookup={onLookup} />
      </div>)}
    </div>
    <div className="world-kitchen-tray" role="group" aria-label="托盘">
      <p>托盘 {tray.length}/6</p>
      <div className="world-context-options">{tray.map((id, index) => {
        const food = foods.find(food => food.id === id)!;
        return <button key={`${id}-${index}`} aria-label={`放回${food.word.hanzi}`} onClick={() => onReturn(index)}>{food.word.hanzi} ×</button>;
      })}</div>
    </div>
  </>;
}
