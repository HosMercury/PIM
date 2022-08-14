import React, { useEffect } from 'react';
import Show from '../components/Show';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loading } from '../components/Loading';
import Header from '../components/Header';

const AttributeShow = () => {
  const params = useParams();

  useEffect(() => {
    document.title = `NEX Content | Attribute #${params.id}`;
  }, [params.id]);

  const fetchAttribute = async () => {
    const response = await fetch('/api/attributes/' + params.id);
    return await response.json();
  };

  const { isLoading, error, data } = useQuery(['attribute'], fetchAttribute);

  if (isLoading) return <Loading />;

  if (error) return 'An error has occurred';

  const title = `Attribute ( ${data.name} )`;

  return (
    <>
      <Header title={title} first="Attributes" second={title} />
      <Show data={data} />
    </>
  );
};

export default AttributeShow;