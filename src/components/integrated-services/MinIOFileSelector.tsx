// SPDX-FileCopyrightText: 2024 University of Applied Sciences Osnabrück
// SPDX-FileContributor: Andreas Schliebitz
// SPDX-FileContributor: Henri Graf
// SPDX-FileContributor: Jonas Tüpker
// SPDX-FileContributor: Lukas Hesse
// SPDX-FileContributor: Maik Fruhner
// SPDX-FileContributor: Prof. Dr.-Ing. Heiko Tapken
// SPDX-FileContributor: Tobias Wamhof
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { SyntheticEvent, useState } from 'react';
import * as React from 'react';

import useKeycloak from '../../contexts/KeycloakContext';
import { httpGet, httpPatch } from '../../api';
import { INTEGRATED_SERVICES_PATH } from '../../endpoints';

import {
    Alert,
    Button,
    CircularProgress,
    Collapse,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from '@mui/material';
import { TreeItem, TreeView, treeItemClasses, useTreeItem, TreeItemContentProps } from '@mui/x-tree-view';
import { LoadingButton } from '@mui/lab';
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';
import { alpha, styled } from '@mui/material/styles';
import DescriptionIcon from '@mui/icons-material/Description';
import clsx from 'clsx';
import Typography from '@mui/material/Typography';
import { TransitionProps } from '@mui/material/transitions';
import { useSpring, animated } from '@react-spring/web';

interface RenderTree {
    path: string;
    name: string;
    children?: readonly RenderTree[];
}

const CustomContent = React.forwardRef(function CustomContent(props: TreeItemContentProps, ref) {
    const { classes, className, label, nodeId, icon: iconProp, expansionIcon, displayIcon } = props;

    const { disabled, expanded, selected, focused, handleExpansion, handleSelection, preventSelection } =
        useTreeItem(nodeId);

    const icon = iconProp || expansionIcon || displayIcon;

    const handleMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        preventSelection(event);
    };

    const handleExpansionClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        handleExpansion(event);
    };

    const handleSelectionClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        //handleExpansionClick(event);
        handleSelection(event);
    };

    return (
        <div
            className={clsx(className, classes.root, {
                [classes.expanded]: expanded,
                [classes.selected]: selected,
                [classes.focused]: focused,
                [classes.disabled]: disabled,
            })}
            onMouseDown={handleMouseDown}
            ref={ref as React.Ref<HTMLDivElement>}
        >
            <div onClick={handleExpansionClick} className={classes.iconContainer}>
                {icon}
            </div>
            <Typography onClick={handleSelectionClick} component="div" className={classes.label}>
                {label}
            </Typography>
        </div>
    );
});

export default function ({
    onClose,
    multiSelect,
}: {
    onClose?: (selectedFiles: string[]) => void;
    multiSelect: true | undefined;
}) {
    const keycloak = useKeycloak();
    const [filePaths, setFilePaths] = useState<string[]>([]);
    const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [buttonText, setButtonText] = useState('');
    const [explorerFiles, setExplorerFiles] = useState(Object);

    const onNodeSingleSelect = (event: SyntheticEvent<Element, Event>, nodeIds: string[]) => {
        setSelectedNodes([]);
        //setSelectedNodes(nodeIds);
        if (nodeIds[-1] == '/') {
            //todo
        } else {
            setSelectedNodes(nodeIds);
        }
    };

    const onNodeMultiSelect = (event: SyntheticEvent<Element, Event>, nodeIds: string[]) => {
        //setSelectedNodes(nodeIds);
        setSelectedNodes([]);
        const selectedNodeshelper: any[] = [];
        if (nodeIds.includes(explorerFiles.path)) {
            cascadeSetSelected(explorerFiles, selectedNodeshelper);
        }
        for (const nodeId of nodeIds) {
            if (!selectedNodeshelper.includes(nodeId)) {
                if (nodeId.includes(explorerFiles.path)) {
                    for (const child of explorerFiles.children) {
                        checkPathOverlap(nodeId, child, selectedNodeshelper);
                    }
                }
            }
        }
        setSelectedNodes(selectedNodeshelper);
    };

    const cascadeSetSelected = (node: any, selectedNodes: any[]) => {
        if (!selectedNodes.includes(node.path)) {
            selectedNodes.push(node.path);
            if (Array.isArray(node.children)) {
                for (const child of node.children) {
                    cascadeSetSelected(child, selectedNodes);
                }
            } else {
                return;
            }
        } else {
            return;
        }
    };

    const checkPathOverlap = (nodeId: string, child: any, selectedNodes: any[]) => {
        if (nodeId == child.path && !selectedNodes.includes(child.path)) {
            cascadeSetSelected(child, selectedNodes);
            return;
        } else if (Array.isArray(child.children)) {
            for (const c of child.children) {
                if (nodeId.includes(c.path)) {
                    checkPathOverlap(nodeId, c, selectedNodes);
                }
            }
        } else {
            return;
        }
    };

    const updateFilePaths = (event: SyntheticEvent<Element, Event>, nodeIds: string[]) => {
        const paths = [];
        for (const id of nodeIds) {
            if (
                id.slice(-1) == '/' &&
                !nodeIds.includes(id.slice(0, -1).substring(0, id.slice(0, -1).lastIndexOf('/')) + '/')
            ) {
                paths.push(id);
            } else if (id.slice(-1) != '/' && !nodeIds.includes(id.substring(0, id.lastIndexOf('/')) + '/')) {
                paths.push(id);
            }
        }
        setFilePaths(paths);
    };

    function MinusSquare(props: SvgIconProps) {
        return (
            <SvgIcon fontSize="inherit" style={{ width: 14, height: 14 }} {...props}>
                {/* tslint:disable-next-line: max-line-length */}
                <path d="M22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0zM17.873 11.023h-11.826q-.375 0-.669.281t-.294.682v0q0 .401.294 .682t.669.281h11.826q.375 0 .669-.281t.294-.682v0q0-.401-.294-.682t-.669-.281z" />
            </SvgIcon>
        );
    }

    function PlusSquare(props: SvgIconProps) {
        return (
            <SvgIcon fontSize="inherit" style={{ width: 14, height: 14 }} {...props}>
                {/* tslint:disable-next-line: max-line-length */}
                <path d="M22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0zM17.873 12.977h-4.923v4.896q0 .401-.281.682t-.682.281v0q-.375 0-.669-.281t-.294-.682v-4.896h-4.923q-.401 0-.682-.294t-.281-.669v0q0-.401.281-.682t.682-.281h4.923v-4.896q0-.401.294-.682t.669-.281v0q.401 0 .682.281t.281.682v4.896h4.923q.401 0 .682.281t.281.682v0q0 .375-.281.669t-.682.294z" />
            </SvgIcon>
        );
    }

    function CloseSquare(props: SvgIconProps) {
        return (
            <SvgIcon className="close" fontSize="inherit" style={{ width: 14, height: 14 }} {...props}>
                {/* tslint:disable-next-line: max-line-length */}
                <path d="M17.485 17.512q-.281.281-.682.281t-.696-.268l-4.12-4.147-4.12 4.147q-.294.268-.696.268t-.682-.281-.281-.682.294-.669l4.12-4.147-4.12-4.147q-.294-.268-.294-.669t.281-.682.682-.281.696 .268l4.12 4.147 4.12-4.147q.294-.268.696-.268t.682.281 .281.669-.294.682l-4.12 4.147 4.12 4.147q.294.268 .294.669t-.281.682zM22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0z" />
            </SvgIcon>
        );
    }

    const StyledTreeItem = styled((props: any) => <TreeItem ContentComponent={CustomContent} {...props} />)(
        ({ theme }) => ({
            [`& .${treeItemClasses.iconContainer}`]: {
                '& .close': {
                    opacity: 0.3,
                },
            },
            [`& .${treeItemClasses.group}`]: {
                marginLeft: 15,
                paddingLeft: 18,
                borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`,
            },
        }),
    );

    const renderTree = (nodes: RenderTree) => (
        <StyledTreeItem key={nodes.path} nodeId={nodes.path} label={nodes.name}>
            {Array.isArray(nodes.children) ? nodes.children.map((node) => renderTree(node)) : null}
        </StyledTreeItem>
    );

    const loadMinIOFiles = () => {
        httpGet(keycloak, `${INTEGRATED_SERVICES_PATH}/files`)
            .then((response) => {
                setExplorerFiles(response);
                setDialogOpen(true);
                console.log(response);
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
    };

    const handleDialogSelect = () => {
        multiSelect
            ? setButtonText(selectedNodes.filter((x) => x.slice(-1) != '/').length + ' Files Selected')
            : setButtonText(selectedNodes.toString());

        if (onClose) {
            multiSelect ? onClose(selectedNodes.filter((x) => x.slice(-1) != '/')) : onClose(selectedNodes);
        }
        setDialogOpen(false);
    };

    return (
        <>
            {dialogOpen ? (
                <Dialog
                    open={true}
                    onClose={handleDialogClose}
                    fullWidth
                    maxWidth="sm"
                    style={{ height: '90%', minHeight: '90%' }}
                >
                    <DialogTitle textAlign={'center'}>{'MinIO File Explorer'}</DialogTitle>
                    <DialogContent>
                        {explorerFiles ? (
                            <TreeView
                                //aria-label="rich object"
                                multiSelect={multiSelect}
                                defaultCollapseIcon={<MinusSquare />}
                                defaultExpandIcon={<PlusSquare />}
                                defaultEndIcon={<DescriptionIcon color="success" />}
                                defaultExpanded={['root', '']}
                                selected={selectedNodes}
                                onNodeSelect={multiSelect ? onNodeMultiSelect : onNodeSingleSelect}
                                //onNodeToggle={updateNodeToggle}
                                sx={{ height: '100%', flexGrow: 1, maxWidth: 400, overflowY: 'auto' }}
                            >
                                {renderTree(explorerFiles)}
                            </TreeView>
                        ) : (
                            <CircularProgress color="success" />
                        )}
                    </DialogContent>
                    <DialogActions>
                        {multiSelect && selectedNodes.length ? (
                            <Alert>{selectedNodes.filter((x) => x.slice(-1) != '/').length + ' Files Selected'}</Alert>
                        ) : null}
                        {!multiSelect && !selectedNodes.toString().endsWith('/') && selectedNodes.length ? (
                            <Alert>{selectedNodes + ' Selected'}</Alert>
                        ) : null}
                        <LoadingButton
                            disabled={
                                multiSelect && selectedNodes.length ? false : selectedNodes.toString().endsWith('/')
                            }
                            onClick={handleDialogSelect}
                        >
                            {'Select'}
                        </LoadingButton>
                    </DialogActions>
                </Dialog>
            ) : (
                <Button variant="outlined" onClick={loadMinIOFiles} sx={{ mr: '10px', textTransform: 'none' }}>
                    {'Select Files'}
                </Button>
            )}
            {buttonText}
        </>
    );
}
