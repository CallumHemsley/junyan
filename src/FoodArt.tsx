import type { Food } from "./contracts";
export default function FoodArt({ kind }: { kind: Food["kind"] }) {
  return (
    <svg viewBox="0 0 64 48" aria-hidden="true" className="food-art">
      <ellipse cx="32" cy="40" rx="25" ry="5" fill="#cfc2ab" opacity=".35" />
      {kind === "bun" || kind === "bread" ? (
        <>
          <path
            d="M9 32C8 17 19 8 32 8S56 17 55 32Q53 41 32 41T9 32"
            fill="#ecdbb7"
            stroke="#ad9272"
            strokeWidth="1.5"
          />
          <path
            d="M16 27q6-13 16-15m0 0q-3 9-1 18m1-18q9 6 13 15"
            fill="none"
            stroke="#cbb590"
            strokeWidth="2"
          />
          {kind === "bun" && <path d="m24 13 8-5 8 5-8 5Z" fill="#d2b98e" />}
        </>
      ) : kind === "egg" ? (
        <>
          <ellipse
            cx="32"
            cy="27"
            rx="20"
            ry="14"
            fill="#fff9e9"
            stroke="#c1ad8e"
            strokeWidth="1.5"
          />
          <circle cx="33" cy="25" r="9" fill="#dfb25c" />
          <path
            d="M29 20q4-3 8 0"
            fill="none"
            stroke="#f5d895"
            strokeWidth="2"
          />
        </>
      ) : kind === "milk" ? (
        <>
          <path
            d="m20 12 3 29h20l3-29"
            fill="#d7e0d1"
            stroke="#7e998a"
            strokeWidth="1.5"
          />
          <ellipse
            cx="33"
            cy="12"
            rx="13"
            ry="4"
            fill="#f4e5c6"
            stroke="#7e998a"
            strokeWidth="1.5"
          />
          <path d="m36 10 6-9" stroke="#8b785e" strokeWidth="2" />
        </>
      ) : kind === "youtiao" ? (
        <>
          <path
            d="m15 35 22-29q4-4 7 1L24 40q-8 5-9-5"
            fill="#cb9146"
            stroke="#a57338"
            strokeWidth="1.5"
          />
          <path
            d="m26 37 22-28q5-4 7 1L36 41q-7 5-10-4"
            fill="#e5b566"
            stroke="#a57338"
            strokeWidth="1.5"
          />
          <path
            d="m23 29 5 2m4-14 5 3m6 5 5 2"
            stroke="#f1cf88"
            strokeWidth="2"
          />
        </>
      ) : (
        <>
          <ellipse
            cx="32"
            cy="23"
            rx="25"
            ry="12"
            fill="#f5ead0"
            stroke="#8d9d8b"
            strokeWidth="1.5"
          />
          <path
            d="M7 23q3 22 25 22t25-22q-24 16-50 0"
            fill="#a4b9a3"
            stroke="#7e998a"
            strokeWidth="1.5"
          />
          {kind === "dumpling" ? (
            <>
              <path
                d="M17 24q0-17 14 0zm14 0q0-17 14 0z"
                fill="#e0cfab"
                stroke="#ac9670"
              />
            </>
          ) : (
            <>
              <path
                d="m19 21 5 1m4-4 6 2m4 5 5-2"
                stroke="#d0b98b"
                strokeWidth="2"
              />
            </>
          )}
        </>
      )}
    </svg>
  );
}
