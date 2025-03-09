import { useParams } from "react-router-dom";

export default function RoomInfo() {
  const { id } = useParams();

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Room Info: {id}</h1>
      <p>This is where room details will go.</p>
    </div>
  );
}
