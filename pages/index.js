import Head from "next/head";
import useSWR from "swr";
import styles from "../styles/Home.module.css";
import { forwardRef, useEffect, useState } from "react";
import FlipMove from "react-flip-move";

export default function Home() {
  const fetcher = (...args) => fetch(...args).then((res) => res.json());

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

  const CryptoCard = forwardRef((d, ref) => (
    <div
      ref={ref}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 5,
      }}
    >
      <p
        style={{
          filter: favorites.includes(d.id) ? "none" : "grayscale(100%)",
          cursor: "pointer",
          opacity: favorites.includes(d.id) ? 1 : 0.5,
          marginRight: 5,
        }}
        onClick={() => handleFavorite(d.id)}
      >
        ⭐
      </p>
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
          {(parseFloat(d["1d"].price_change_pct) * 100).toFixed(2)}%
        </p>
        )
      </p>
      <p style={{ color: "white", fontWeight: 600 }}>
        🧢 {currency.icon}
        {d.market_cap.toString().length > 7
          ? d.market_cap.toString().slice(0, d.market_cap.toString().length - 7)
              .length > 3
            ? `${parseFloat(
                d.market_cap
                  .toString()
                  .slice(0, d.market_cap.toString().length - 8) / 100
              )}B`
            : `${parseFloat(
                d.market_cap
                  .toString()
                  .slice(0, d.market_cap.toString().length - 6) / 10
              )}M`
          : d.market_cap}
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
          <span style={{ display: "flex" }}>
            To the m
            <span style={{ display: "flex", alignItems: "center" }}>
              <p style={{ fontSize: 32, margin: 0, paddingTop: 20 }}>🌑</p>
              <p
                style={{
                  fontSize: 32,
                  margin: 0,
                  marginLeft: -5,
                  paddingTop: 20,
                }}
              >
                🌑
              </p>
              n
            </span>
          </span>
        </h1>
        <div
          style={{
            display: "flex",
            width: 350,
            justifyContent: "space-between",
            margin: "20px 0",
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
          <div
            style={{
              color: "white",
              cursor: "pointer",
              padding: 5,
              filter: showFavorites ? "none" : "grayscale(100%)",
            }}
            onClick={() => setShowFavorites(!showFavorites)}
          >
            ⭐
          </div>
        </div>

        <div>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            style={{ padding: 10, width: 300 }}
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
                  <p>Oops, looks like there's nothing to show!</p>
                )
              ) : (
                <p style={{ color: "white", fontWeight: 600 }}>
                  Oops, looks like there's nothing to show!
                </p>
              )
            ) : (
              <p style={{ color: "white", fontWeight: 600 }}>
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
