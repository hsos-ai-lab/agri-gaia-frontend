// SPDX-FileCopyrightText: 2026 Osnabrück University of Applied Sciences
// SPDX-FileContributor: Prof. Dr.-Ing. Heiko Tapken
//
// SPDX-License-Identifier: MIT

import { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { IDeviceRecommendation, IDeviceCandidateResult } from '../../types/edge-benchmark/IDeviceRecommendation';

interface IAutoSearchResultModalProps {
    recommendation: IDeviceRecommendation;
    deviceNameByHostname: Record<string, string>;
    onClose: () => void;
}

const formatNumber = (value: number | null, digits = 2): string =>
    value === null || value === undefined ? 'N/A' : value.toFixed(digits);

export default function ({ recommendation, deviceNameByHostname, onClose }: IAutoSearchResultModalProps) {
    const { factor, latency_metric, latency_threshold_ms, winner_hostname, candidates } = recommendation;

    const renderDevice = (hostname: string, trailing?: ReactNode) => {
        const name = deviceNameByHostname[hostname]?.trim();
        return name ? (
            <>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" fontWeight="bold">
                        {name}
                    </Typography>
                    {trailing}
                </Box>
                <Typography variant="caption" color="text.secondary">
                    {hostname}
                </Typography>
            </>
        ) : (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2">{hostname}</Typography>
                {trailing}
            </Box>
        );
    };

    return (
        <Dialog open onClose={onClose} fullWidth maxWidth="lg">
            <DialogTitle>
                Recommendation — optimize for <b>{factor}</b> with {latency_metric} latency &le;{' '}
                {latency_threshold_ms} ms
            </DialogTitle>
            <DialogContent>
                {winner_hostname ? null : (
                    <Typography sx={{ mb: 2 }} color="error">
                        No device satisfied the latency constraint. See reasons below.
                    </Typography>
                )}
                <TableContainer component={Paper}>
                    <Table aria-label="auto-search comparison" size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Device</TableCell>
                                <TableCell align="right">{latency_metric} latency (ms)</TableCell>
                                <TableCell align="right">Energy (J)</TableCell>
                                <TableCell align="right">Cost (€)</TableCell>
                                <TableCell align="right">Accuracy</TableCell>
                                <TableCell align="center">Meets constraint</TableCell>
                                <TableCell>Note</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {candidates.map((candidate: IDeviceCandidateResult) => {
                                const isWinner = candidate.hostname === winner_hostname;
                                return (
                                    <TableRow
                                        key={candidate.hostname}
                                        sx={{
                                            backgroundColor: isWinner
                                                ? 'rgba(76, 175, 80, 0.18)'
                                                : candidate.meets_constraint
                                                  ? 'transparent'
                                                  : 'rgba(244, 67, 54, 0.08)',
                                        }}
                                    >
                                        <TableCell>
                                            {renderDevice(
                                                candidate.hostname,
                                                isWinner ? (
                                                    <Chip
                                                        label="Winner"
                                                        color="success"
                                                        size="small"
                                                        sx={{ ml: 1 }}
                                                    />
                                                ) : null,
                                            )}
                                        </TableCell>
                                        <TableCell align="right">{formatNumber(candidate.latency_ms, 1)}</TableCell>
                                        <TableCell align="right">{formatNumber(candidate.energy_joules, 2)}</TableCell>
                                        <TableCell align="right">{formatNumber(candidate.cost_eur, 0)}</TableCell>
                                        <TableCell align="right">{formatNumber(candidate.accuracy, 3)}</TableCell>
                                        <TableCell align="center">{candidate.meets_constraint ? '✓' : '✗'}</TableCell>
                                        <TableCell>{candidate.excluded_reason ?? ''}</TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}
