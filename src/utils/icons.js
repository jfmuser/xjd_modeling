const icons = {
  normal: {
    fullscreen: new URL('../icons/full_screen_on_default.png', import.meta.url)
      .href,
    offscreen: new URL('../icons/full_screen_off_default.png', import.meta.url)
      .href,
    close: new URL(
      '../icons/jobdetail_outputsfromjob_visualization_close_default.png',
      import.meta.url,
    ).href,
    left: new URL(
      '../icons/jobdetail_outputsfromjob_visualization_pagebackward_default.png',
      import.meta.url,
    ).href,
    right: new URL(
      '../icons/jobdetail_outputsfromjob_visualization_pageforward_default.png',
      import.meta.url,
    ).href,
    success: new URL('../icons/dashboard_job_complete.png', import.meta.url)
      .href,
    failed: new URL('../icons/dashboard_job_failed.png', import.meta.url).href,
    'tree-line': new URL('../icons/tree_line_default.png', import.meta.url)
      .href,
    'tree-spectrum': new URL(
      '../icons/tree_spectrum_default.png',
      import.meta.url,
    ).href,
    query: new URL('../icons/dashboard_log_search_default.png', import.meta.url)
      .href,
    edit: new URL('../icons/svg/edit_default.svg', import.meta.url).href,
    dashBoardFold: new URL(
      '../icons/svg/fold_dashboard_default.svg',
      import.meta.url,
    ).href,
    fold: new URL('../icons/svg/fold_default.svg', import.meta.url).href,
    dashBoardUnfold: new URL(
      '../icons/svg/unfold_dashboard_default.svg',
      import.meta.url,
    ).href,
    unfold: new URL('../icons/svg/unfold_default.svg', import.meta.url).href,
  },
  active: {
    fullscreen: new URL('../icons/full_screen_on_click.png', import.meta.url)
      .href,
    offscreen: new URL('../icons/full_screen_off_click.png', import.meta.url)
      .href,
    close: new URL(
      '../icons/jobdetail_outputsfromjob_visualization_close_click.png',
      import.meta.url,
    ).href,
    left: new URL(
      '../icons/jobdetail_outputsfromjob_visualization_pagebackward_click.png',
      import.meta.url,
    ).href,
    right: new URL(
      '../icons/jobdetail_outputsfromjob_visualization_pageforward_click.png',
      import.meta.url,
    ).href,
    query: new URL('../icons/dashboard_log_search_click.png', import.meta.url)
      .href,
    edit: new URL('../icons/svg/edit_click.svg', import.meta.url).href,
    dashBoardFold: new URL(
      '../icons/svg/fold_dashboard_click.svg',
      import.meta.url,
    ).href,
    fold: new URL('../icons/svg/fold_hover&click.svg', import.meta.url).href,
    dashBoardUnfold: new URL(
      '../icons/svg/unfold_dashboard_click.svg',
      import.meta.url,
    ).href,
    unfold: new URL('../icons/svg/unfold_hover&click.svg', import.meta.url)
      .href,
  },
  hover: {
    fullscreen: new URL('../icons/full_screen_on_hover.png', import.meta.url)
      .href,
    offscreen: new URL('../icons/full_screen_off_hover.png', import.meta.url)
      .href,
    close: new URL(
      '../icons/jobdetail_outputsfromjob_visualization_close_hover.png',
      import.meta.url,
    ).href,
    left: new URL(
      '../icons/jobdetail_outputsfromjob_visualization_pagebackward_hover.png',
      import.meta.url,
    ).href,
    right: new URL(
      '../icons/jobdetail_outputsfromjob_visualization_pageforward_hover.png',
      import.meta.url,
    ).href,
    'tree-line': new URL('../icons/tree_line_hover&click.png', import.meta.url)
      .href,
    'tree-spectrum': new URL(
      '../icons/tree_spectrum_hover&click.png',
      import.meta.url,
    ).href,
    query: new URL('../icons/dashboard_log_search_hover.png', import.meta.url)
      .href,
    edit: new URL('../icons/svg/edit_hover.svg', import.meta.url).href,
    dashBoardFold: new URL(
      '../icons/svg/fold_dashboard_hover.svg',
      import.meta.url,
    ).href,
    fold: new URL('../icons/svg/fold_hover&click.svg', import.meta.url).href,
    dashBoardUnfold: new URL(
      '../icons/svg/unfold_dashboard_hover.svg',
      import.meta.url,
    ).href,
    unfold: new URL('../icons/svg/unfold_hover&click.svg', import.meta.url)
      .href,
  },
  downloadReport: {
    default: new URL('../icons/download_report_default.png', import.meta.url)
      .href,
    hover: new URL('../icons/download_report_hover.png', import.meta.url).href,
    click: new URL('../icons/download_report_click.png', import.meta.url).href,
    disabled: new URL('../icons/download_report_disable.png', import.meta.url)
      .href,
  },
  downloadModel: {
    default: new URL('../icons/download_model_default.png', import.meta.url)
      .href,
    hover: new URL('../icons/download_model_hover.png', import.meta.url).href,
    click: new URL('../icons/download_model_click.png', import.meta.url).href,
    disabled: new URL('../icons/download_model_disable.png', import.meta.url)
      .href,
  },
  downloadData: {
    default: new URL('../icons/download_data_default.png', import.meta.url)
      .href,
    hover: new URL('../icons/download_data_hover.png', import.meta.url).href,
    click: new URL('../icons/download_data_click.png', import.meta.url).href,
    disabled: new URL('../icons/download_data_disable.png', import.meta.url)
      .href,
  },
  pearsonSortby: {
    default: new URL(
      '../components/CanvasComponent/pearsonDiagram/icons/sortby_default.png',
      import.meta.url,
    ).href,
    hover: new URL(
      '../components/CanvasComponent/pearsonDiagram/icons/sortby_hover.png',
      import.meta.url,
    ).href,
    active: new URL(
      '../components/CanvasComponent/pearsonDiagram/icons/sortby_click.png',
      import.meta.url,
    ).href,
  },
  pearsonFilter: {
    default: new URL(
      '../components/CanvasComponent/pearsonDiagram/icons/filter_default.png',
      import.meta.url,
    ).href,
    hover: new URL(
      '../components/CanvasComponent/pearsonDiagram/icons/filter_hover.png',
      import.meta.url,
    ).href,
    click: new URL(
      '../components/CanvasComponent/pearsonDiagram/icons/filter_click.png',
      import.meta.url,
    ).href,
  },
};

export default icons;
