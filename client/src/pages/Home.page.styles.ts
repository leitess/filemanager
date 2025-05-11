import styled from 'styled-components';

const Container = styled.div`
  padding: 2rem;
  font-family: sans-serif;
`;

const FileInput = styled.input`
  margin-bottom: 1rem;
`;

const UploadButton = styled.button`
  background-color: #0070f3;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 1rem;
`;

const FileTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 2rem;
`;

const TableHeader = styled.th`
  border-bottom: 1px solid #ccc;
  text-align: left;
  padding: 0.5rem;
`;

const TableCell = styled.td`
  padding: 0.5rem;
  border-bottom: 1px solid #eee;
`;

const ActionButton = styled.button`
  margin-right: 0.5rem;
  background: none;
  color: #0070f3;
  border: none;
  cursor: pointer;
`;

export {
  ActionButton,
  Container,
  FileInput,
  FileTable,
  TableCell,
  TableHeader,
  UploadButton,
};
