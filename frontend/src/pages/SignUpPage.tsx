import { SignUpForm } from "../features/user/components/SignUpForm";

export const SignUpPage: React.FC = () => {
  return (
    <main className="w-4/5 sm:w-2/5 md:w-80 max-w-sm flex justify-center flex-col rounded border p-5 bg-white shadow-sm">
      <h1 className="text-blue-500 text-center text-4xl font-extrabold mb-4">
        VOCATEST
      </h1>
      <SignUpForm />
    </main>
  );
};
