import React, { useState } from "react";
import { GetServerSideProps } from "next";
import ModelList from "@/components/sidebar/sidebar-modellist"; // Adjust the path as necessary

interface ModelsPageProps {
  models: string[];
}

export const getServerSideProps: GetServerSideProps = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/models`);
  const models = await res.json();
  return {
    props: {
      models,
    },
  };
};

const ModelsPage: React.FC<ModelsPageProps> = ({ models }) => {
  const [isModelListCollapsed, setIsModelListCollapsed] = useState(false);
  const selectedChatId = ""; // Adjust as needed

  return (
    <ModelList
      models={models}
      selectedChatId={selectedChatId}
      isModelListCollapsed={isModelListCollapsed}
      setIsModelListCollapsed={setIsModelListCollapsed}
    />
  );
};

export default ModelsPage;
