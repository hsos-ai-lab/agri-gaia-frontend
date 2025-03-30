// SPDX-FileCopyrightText: 2024 Osnabrück University of Applied Sciences
// SPDX-FileContributor: Andreas Schliebitz
// SPDX-FileContributor: Henri Graf
// SPDX-FileContributor: Jonas Tüpker
// SPDX-FileContributor: Lukas Hesse
// SPDX-FileContributor: Maik Fruhner
// SPDX-FileContributor: Prof. Dr.-Ing. Heiko Tapken
// SPDX-FileContributor: Tobias Wamhof
//
// SPDX-License-Identifier: MIT

import { useState, ChangeEvent, useRef } from 'react';
import Button from '@mui/material/Button';

interface IFileInputProps {
    text: string;
    accept: string;
    multiple: boolean;
    onChange?: (files: FileList) => void;
}

export default function FileInput({ text, accept, multiple, onChange }: IFileInputProps) {
    const [selectedFiles, setSelectedFiles] = useState<FileList>();
    // this artificial counter helps to re-render the Component, after new files were selected
    // In FireFox, the FileList from the input element is only created once and then only mutated on change
    // react does not update, if the contents of a list reference update.
    // Therefore we increment a counter to notify that the view should update...
    // https://github.com/facebook/react/issues/18104#issuecomment-590038146
    const [fileChangeCounter, setFileChangeCounter] = useState(0);
    const inputEl = useRef<HTMLInputElement>(null);

    function handleFilesChanged(event: ChangeEvent) {
        const input = event.currentTarget as HTMLInputElement;
        if (input.files && input.files.length) {
            setSelectedFiles(input.files);
            setFileChangeCounter(fileChangeCounter + 1);
            if (onChange) {
                onChange(input.files);
            }
        }
    }

    function onButtonClick() {
        if (inputEl && inputEl.current) {
            inputEl.current.click();
        }
    }

    function getSelectedCountText() {
        const fileCount = selectedFiles?.length;
        if (!fileCount) {
            return 'No Files selected.';
        }
        if (fileCount === 1) {
            return selectedFiles[0].name;
        }
        return `${fileCount} Files selected.`;
    }

    return (
        <div>
            <input
                ref={inputEl}
                type="file"
                multiple={multiple}
                accept={accept}
                onChange={handleFilesChanged}
                style={{ display: 'none' }}
            />
            <Button variant="outlined" onClick={onButtonClick} sx={{ mr: '10px', textTransform: 'none' }}>
                {text}
            </Button>
            {getSelectedCountText()}
        </div>
    );
}
