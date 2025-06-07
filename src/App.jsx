import "./App.css";
import Routes from "./routes/Routes";
import useFetchList from "./hooks/useFetchList";
import useQuery from "./hooks/useQuery";
function App() {
  const [query, updateQuery, resetQuery] = useQuery({});
  const [data] = useFetchList("products", query, {});
  console.log("cc");
  console.log("Lo lo data ne: ", data);
  return (
    <>
      <div></div>

      <Routes />
    </>
  );
}

export default App;
