import Image from "next/image";
import Button from "./buttons";
import Lobby from "./lobby";

export default async function Home() {
  const activeUsersTask = fetch("http://localhost:9001/activeUsers").then(response => response.json());
  const lobbiesTask = fetch("http://localhost:9001/lobbies").then(response => response.json());
  const [activeUsers, lobbies]: [any[], any[]] = await Promise.all([activeUsersTask, lobbiesTask]);
  // const activeUsers: any[] = await response.json();

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <div className="text-4xl font-bold">Dashboard</div>
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        {activeUsers.length == 0 ? (
          <p>No active users</p>
        ) : (
          <div>
            <h1 className="text-2xl font-bold">Active Users</h1>
            <ul className="list-disc">
              {activeUsers.map(({ username, lobbyId }) => (
                <li key={username}>{username}</li>
              ))}
            </ul>
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold">Lobbies</h1>
          {lobbies.length == 0 ? (
            <p>None</p>
          ) : (
            <div>
              {lobbies.map(({ id, playerObjects, players }) => (
                <Lobby key={id} lobbyId={id} playerObjects={playerObjects} players={players} />
              ))}
            </div>
          )}
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center"></footer>
    </div>
  );
}
