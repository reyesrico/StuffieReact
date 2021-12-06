import React, { useState } from 'react';
import Loading from '../shared/Loading';

interface Movie { id: number, title: string };

const allMovies: Movie[] = [
  { id: 1, title: "one" },
  { id: 2, title: "two" },
  { id: 3, title: "two" },
  { id: 3, title: "four" },
];

const Test4 = () => {
  let [movies, setMovies] = useState<Movie[]>(allMovies);
  let [loading, setLoading] = useState<boolean>(false);

  const getMoviesFiltered = async (text: string) => {
    let promise = new Promise<Movie[]>((resolve, _) => {
      setTimeout(() => {
        let filteredMovies = allMovies.filter((m: Movie) => {
          return (m.title.includes(text));
        });
        resolve(filteredMovies);
      }, 500);
    });
    return promise;
  }

  const setFilter = (event: any) => {
    let text = event.target.value;
    if (text) {
      setLoading(true);
      getMoviesFiltered(text)
        .then(res => setMovies(res))
        .finally(() => setLoading(false));
    } else {
      setMovies(allMovies);
      setLoading(false);
    }
  }

  return (
    <div>
      <h2>Microsoft Tech Screen</h2>
      <hr />
      <input type="text" onChange={setFilter} />
      {loading && (<Loading size='md' message='Loading'></Loading>)}
      {!loading && (
        <ul>
          {movies.map((m: Movie, index: number) => (
            <li key={index}>{m.title}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Test4;
