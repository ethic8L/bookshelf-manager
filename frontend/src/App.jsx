import React, { useEffect, useState } from "react";

import './App.css'

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function App() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ title: "", author: "", year: "" });

  const fetchBooks = async (q = "") => {
    const url = `${API_BASE}/books${q ? `?search=${encodeURIComponent(q)}` : ""}`;
    const res = await fetch(url);
    setBooks(await res.json());
  };

  useEffect(() => { fetchBooks(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    await fetch(`${API_BASE}/books`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        author: form.author,
        year: parseInt(form.year) || undefined
      })
    });
    setForm({ title: "", author: "", year: "" });
    fetchBooks();
  };

  const remove = async (id) => {
    await fetch(`${API_BASE}/books/${id}`, { method: "DELETE" });
    fetchBooks(search);
  };

  const doSearch = (e) => {
    e.preventDefault();
    fetchBooks(search);
  };

  return (
     <div style={{ padding: 24, fontFamily: "Arial, sans-serif" }}>
      <h1>BookShelf Manager</h1>

      <form onSubmit={doSearch} style={{ marginBottom: 12 }}>
        <input placeholder="Szukaj po tytule/autorze" value={search} onChange={e => setSearch(e.target.value)} />
        <button type="submit">Szukaj</button>
        <button type="button" onClick={() => { setSearch(""); fetchBooks(); }}>Wyczyść</button>
      </form>

      <form onSubmit={submit} style={{ marginBottom: 18 }}>
        <input placeholder="Tytuł" value={form.title} required onChange={e => setForm({ ...form, title: e.target.value })} />
        <input placeholder="Autor" value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} />
        <input placeholder="Rok" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} />
        <button type="submit">Dodaj książkę</button>
      </form>

      <h2>Lista książek ({books.length})</h2>
      <ul>
        {books.map(b => (
          <li key={b._id} style={{ marginBottom: 8 }}>
            <strong>{b.title}</strong> — {b.author} {b.year ? `(${b.year})` : ""}{" "}
            <button onClick={() => remove(b._id)}>Usuń</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
