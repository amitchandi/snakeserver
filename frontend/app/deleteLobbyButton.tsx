"use client";
export default function DeleteLobbyButton() {

  function asd() {
    console.log('asd');
  }

  return (
    <button onClick={asd}>
      <img src="/delete.svg" alt="delete" className="object-cover" width={30} height={30} />
    </button>
  );
}
