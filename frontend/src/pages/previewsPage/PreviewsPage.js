import React, { useEffect, useState } from "react";
import HomeItem from "../../components/homeItem/HomeItem";
import categoriesData from '../../categories.json'; // Importa o JSON

const PreviewsPage = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    // Aqui você pode carregar os dados do JSON
    setItems(categoriesData);
  }, []);

  return (
    <div>
      {items.map((item) => (
        <HomeItem 
          key={item.id}
          id={item.id}
          title={item.category}
          src={item.src}
          description={item.description}
        />
      ))}
    </div>
  );
};

export default PreviewsPage;