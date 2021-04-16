import Head from "next/head";
import useSWR from "swr";
import styles from "../styles/Home.module.css";
import { forwardRef, useEffect, useState } from "react";
import FlipMove from "react-flip-move";

export default function Home() {
  const fetcher = (...args) => fetch(...args).then((res) => res.json());

  const curriesList = [
    { display: "USD", icon: "$" },
    { display: "GBP", icon: "£" },
    { display: "EUR", icon: "€" },
    { display: "JPY", icon: "¥" },
    { display: "NOK", icon: "nk " },
  ];

  const [currency, setCurrency] = useState({ display: "NOK", icon: "nk " });
  const { data } = useSWR(generateURL(), fetcher, {
    refreshInterval: 1,
  });
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);

  function generateURL() {
    return `https://api.nomics.com/v1/currencies/ticker?key=8f6b9832bbae75b0a2d35614ec56e788&interval=1d&per-page=100&convert=${currency.display}`;
  }

  useEffect(() => {
    const savedFavorites = window.localStorage.getItem("favorites");
    const savedShowFavorites = window.localStorage.getItem("showFavorites");
    const savedCurrency = window.localStorage.getItem("currency");

    if (savedFavorites && savedFavorites.length > 0) {
      setFavorites(savedFavorites.split(","));
    }

    if (savedShowFavorites && savedShowFavorites === "y") {
      setShowFavorites(true);
    }

    if (savedCurrency) {
      setCurrency(JSON.parse(savedCurrency));
    }
  }, []);

  useEffect(() => {
    if (data) {
      showFavorites
        ? window.localStorage.setItem("showFavorites", "y")
        : window.localStorage.setItem("showFavorites", "n");
      showFavorites
        ? !search.trim().length
          ? setFiltered(data.filter((d) => favorites.includes(d.id)))
          : setFiltered(
              data
                .filter((d) => favorites.includes(d.id))
                .filter(
                  (d) =>
                    d.name
                      .toLocaleLowerCase()
                      .includes(search.toLocaleLowerCase()) ||
                    d.symbol
                      .toLocaleLowerCase()
                      .includes(search.toLocaleLowerCase())
                )
            )
        : !search.trim().length
        ? setFiltered(data)
        : setFiltered(
            data.filter(
              (d) =>
                d.name
                  .toLocaleLowerCase()
                  .includes(search.toLocaleLowerCase()) ||
                d.symbol
                  .toLocaleLowerCase()
                  .includes(search.toLocaleLowerCase())
            )
          );
    }
  }, [showFavorites, data, favorites, search]);

  function handleFavorite(id) {
    favorites.includes(id)
      ? setFavorites(favorites.filter((f) => f !== id))
      : setFavorites([...favorites, id]);
  }

  useEffect(() => {
    window.localStorage.setItem("currency", JSON.stringify(currency));
  }, [currency.display]);

  useEffect(() => {
    window.localStorage.setItem("favorites", favorites.toString());
  }, [favorites]);

  function refactorMarketCap(number) {
    const string = number.toString();
    if (string.length > 10) {
      return `${parseFloat(string.slice(0, string.length - 8) / 100)}B`;
    } else if (string.length > 7) {
      return `${parseFloat(string.slice(0, string.length - 6) / 10)}M`;
    } else {
      return number;
    }
  }

  const CryptoCard = forwardRef((d, ref) => (
    <div ref={ref} className={styles.card}>
      <p
        className={styles.text}
        style={{ filter: !favorites.includes(d.id) ? "grayscale(100%)" : "" }}
        onClick={() => handleFavorite(d.id)}
      >
        ⭐
      </p>
      <p className={(styles.text, styles.currency)}>
        {d.id} - {currency.icon}
        {d.price > 10 ? parseFloat(d.price).toFixed(2) : d.price} (
        <p
          className={styles.text}
          style={{
            color: d["1d"].price_change_pct[0] === "-" ? "red" : "green",
          }}
        >
          {d["1d"].price_change_pct[0] !== "-" && "+"}
          {(parseFloat(d["1d"].price_change_pct) * 100).toFixed(2)}%
        </p>
        )
      </p>
      <p className={(styles.text, styles.currency)}>
        🧢 {currency.icon}
        {refactorMarketCap(d.market_cap)}
      </p>
    </div>
  ));

  return (
    <div className={styles.container}>
      <Head>
        <title>TTM</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          🚀 <br />
          <span>
            To the m
            <span style={{ alignItems: "center" }}>
              <p className={styles.moon}>🌑</p>
              <p
                className={styles.moon}
                style={{
                  marginLeft: -5,
                }}
              >
                🌑
              </p>
              n
            </span>
          </span>
        </h1>
        <div className={styles.currencies}>
          {curriesList.map((c) => (
            <Currency
              selected={currency.display === c.display}
              currency={c}
              action={(currency) => setCurrency(currency)}
            />
          ))}
          <div
            style={{
              filter: showFavorites ? "none" : "grayscale(100%)",
            }}
            onClick={() => setShowFavorites(!showFavorites)}
          >
            ⭐
          </div>
        </div>

        <div>
          <input
            className={styles.search}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search..."
            aria-label="Search"
          />
        </div>

        <div className={styles.grid}>
          <FlipMove>
            {filtered ? (
              filtered.length > 0 ? (
                filtered
                  .sort(
                    (a, b) =>
                      parseFloat(a["1d"].price_change_pct) -
                      parseFloat(b["1d"].price_change_pct)
                  )
                  .reverse()
                  .map((d) => <CryptoCard key={`${d.id}`} {...d} />) ?? (
                  <p className={styles.error}>
                    Oops, looks like there's nothing to show!
                  </p>
                )
              ) : (
                <p className={styles.error}>
                  Oops, looks like there's nothing to show!
                </p>
              )
            ) : (
              <p className={styles.error}>
                Oops, looks like there's nothing to show!
              </p>
            )}
          </FlipMove>
        </div>
      </main>

      <footer className={styles.footer}>
        <a href="https://nomics.com" style={{ color: "white", fontSize: 11 }}>
          Crypto Market Cap & Pricing Data Provided By Nomics.
        </a>
      </footer>
    </div>
  );
}

const Currency = (props) => {
  return (
    <div
      style={{
        backgroundColor: props.selected ? "#ffffff20" : "",
      }}
      onClick={() => props.action(props.currency)}
    >
      {props.currency.icon} {props.currency.display}
    </div>
  );
};
