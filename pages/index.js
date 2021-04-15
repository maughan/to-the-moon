import Head from "next/head";
import useSWR from "swr";
import styles from "../styles/Home.module.css";
import { forwardRef, useState } from "react";
import FlipMove from "react-flip-move";

export default function Home() {
  const fetcher = (...args) => fetch(...args).then((res) => res.json());
  const [currency, setCurrency] = useState({ display: "USD", icon: "$" });

  const CryptoCard = forwardRef((d, ref) => (
    <div
      ref={ref}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 10,
      }}
    >
      <p
        className={styles.text}
        style={{
          color: "white",
          marginRight: 10,
          display: "flex",
          alignItems: "center",
          whiteSpace: "nowrap",
          fontWeight: 600,
        }}
      >
        {d.id} - {currency.icon}
        {d.price > 10 ? parseFloat(d.price).toFixed(2) : d.price} (
        <p
          className={styles.text}
          style={{
            color: d["1d"].price_change_pct[0] === "-" ? "red" : "green",
          }}
        >
          {d["1d"].price_change_pct[0] !== "-" && "+"}
          {d["1d"].price_change_pct}%
        </p>
        )
      </p>
    </div>
  ));
  const { data } = useSWR(
    `https://api.nomics.com/v1/currencies/ticker?key=8f6b9832bbae75b0a2d35614ec56e788&interval=1d&per-page=150&convert=${currency.display}`,
    fetcher,
    {
      refreshInterval: 100,
    }
  );

  return (
    <div className={styles.container}>
      <Head>
        <title>TTM</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          🚀 <br />
          To the moon
        </h1>
        <div
          style={{
            display: "flex",
            width: 300,
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              color: "white",
              cursor: "pointer",
              padding: 5,
              borderRadius: 5,
              backgroundColor: currency.display === "USD" ? "#ffffff20" : "",
            }}
            onClick={() => setCurrency({ display: "USD", icon: "$" })}
          >
            $ USD
          </div>
          <div
            style={{
              color: "white",
              cursor: "pointer",
              padding: 5,
              borderRadius: 5,
              backgroundColor: currency.display === "GBP" ? "#ffffff20" : "",
            }}
            onClick={() => setCurrency({ display: "GBP", icon: "£" })}
          >
            £ GBP
          </div>
          <div
            style={{
              color: "white",
              cursor: "pointer",
              padding: 5,
              borderRadius: 5,
              backgroundColor: currency.display === "EUR" ? "#ffffff20" : "",
            }}
            onClick={() => setCurrency({ display: "EUR", icon: "€" })}
          >
            € EUR
          </div>
          <div
            style={{
              color: "white",
              cursor: "pointer",
              padding: 5,
              borderRadius: 5,
              backgroundColor: currency.display === "JPY" ? "#ffffff20" : "",
            }}
            onClick={() => setCurrency({ display: "JPY", icon: "¥" })}
          >
            ¥ JPY
          </div>
          <div
            style={{
              color: "white",
              cursor: "pointer",
              padding: 5,
              borderRadius: 5,
              backgroundColor: currency.display === "NOK" ? "#ffffff20" : "",
            }}
            onClick={() => setCurrency({ display: "NOK", icon: "kr " })}
          >
            kr NOK
          </div>
        </div>

        <div className={styles.grid}>
          <FlipMove>
            {data ? (
              data
                .sort(
                  (a, b) =>
                    parseFloat(a["1d"].price_change_pct) -
                    parseFloat(b["1d"].price_change_pct)
                )
                .reverse()
                .map((d) => <CryptoCard key={`${d.id}`} {...d} />)
            ) : (
              <></>
            )}
          </FlipMove>
        </div>
      </main>

      <footer className={styles.footer}>
        <a href="https://nomics.com" style={{ color: "white" }}>
          Crypto Market Cap & Pricing Data Provided By Nomics.
        </a>
      </footer>
    </div>
  );
}
