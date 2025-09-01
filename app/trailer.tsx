import { router } from "expo-router";
import React, { JSX } from "react";
import SimpleTrailer from "../components/SimpleTrailer";

export default function TrailerScreen(): JSX.Element {
  const handleComplete = (): void => {
    router.push("/intro");
  };

  return <SimpleTrailer onComplete={handleComplete} />;
}
