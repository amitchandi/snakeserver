import DeleteLobbyButton from './deleteLobbyButton';

export default function Lobby({ lobbyId, playerObjects, players }: { lobbyId: string, playerObjects: { [key: string]: any }, players: string[] }) {

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden mt-1.5">
      <div className="p-4">
        <div className="flex">
          <img src="/file.svg" alt="file" className="object-cover" width={20} height={20} />
          <DeleteLobbyButton />
        </div>
        <h2 className="text-lg font-semibold mb-1">{lobbyId}</h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">{"description"}</p>

        {players && (
          players.map((player, index) => (
            <div key={index}>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">{player}</p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">{JSON.stringify(playerObjects[player])}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
