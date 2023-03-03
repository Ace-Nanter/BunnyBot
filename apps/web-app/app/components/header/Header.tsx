import UserMenu from './UserMenu';

export default function Header() {
  return (
    <header className="border-b border-slate-300/10 bg-menu">
      <div className="mx-auto flex max-w-full items-center justify-end p-6 lg:px-8">
        <UserMenu />
      </div>
    </header>
  );
}
